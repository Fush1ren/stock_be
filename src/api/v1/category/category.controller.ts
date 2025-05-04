import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../../../config/db";
import { getUserByToken } from "../../../utils/api.util";
import { getCategories } from "./category.service";
import { QueryParams } from "../../../dto/api.dto";
import { getUserById } from "../users/users.service";

const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1]
        if (!req.body) {
            res.status(400).json({ message: "No data provided" });
            return;
        };
        const user = await getUserByToken(token as string);
        const { name } = req.body
        if (!name) {
            res.status(400).json({ status: 400, message: "Name is required" });
            return;
        }
        await prismaClient.category.create({
            data: { name, userId: user?.id as string }
        })
        res.status(200).json({ status: 200, message: "Category created successfully" });
        return;
    } catch (error) {
        next(error);
    }
}

const getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await getCategories();
  
      // Tunggu semua Promise dari getUserById dengan Promise.all
      const users = await Promise.all(
        categories.map((category) => getUserById(category?.userId))
      );
  
      let data = categories.map((category, index) => ({
        id: category.id,
        name: category.name,
        user: {
            id: users[index]?.id,
            username: users[index]?.username,
            name: users[index]?.name,
        },
        updatedAt: category.updatedAt,
        createdAt: category.createdAt,
      }));
  
      const params = req.params as QueryParams;
  
      if (params.page && params.limit) {
        const startIndex = (params.page - 1) * params.limit;
        const endIndex = params.page * params.limit;
        data = data.slice(startIndex, endIndex);
      }
  
      res.status(200).json({
        status: 200,
        message: "Category fetched successfully",
        data: {
          totalRecords: data.length,
          data,
        },
      });
    } catch (error) {
      next(error);
    }
};

export {
    createCategory,
    getCategory,
}