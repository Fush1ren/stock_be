import { NextFunction, Request, Response } from "express";
import { BodyCreateUser } from "../../../dto/user.dto";
import { prismaClient } from "../../../config/db";
import bcrypt from 'bcryptjs'
import { getUserData } from "./users.service";
import { APIRequestBody } from "../../../dto/api.dto";
import { Roles } from "@prisma/client";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            res.status(400).json({ message: "No data provided" });
            return;
        };

        const body: BodyCreateUser = req.body;

        if (!body.username) {
            res.status(400).json({ status: 400, message: "Username is required" });
            return;
        }
        if (!body.name) {
            res.status(400).json({ status: 400, message: "Name is required" });
            return;
        }
        if (!body.password) {
            res.status(400).json({ status: 400, message: "Password is required" });
            return;
        }
        const hashed = await bcrypt.hash(body.password, 10)
        await prismaClient.users.create(
            { 
                data: 
                { 
                    password: hashed, username: body.username, name: body.name, role: body.role as Roles
                } 
            }
        )
        res.status(200).json({ status: 200, message: "User created successfully" });
        return;
    } catch (error) {
        next(error);
    }
}

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let users = await getUserData();
        const body = req.body as APIRequestBody;
        if (body.page && body.limit) {
            const startIndex = (body.page - 1) * body.limit;
            const endIndex = body.page * body.limit;
            const paginatedUsers = users.slice(startIndex, endIndex);
            users = paginatedUsers;
        }
        res.status(200).json({ status: 200, message: 'Successfully Get Users Data!', data: {
            total: users.length,
            data: users
        } });
        return;
    } catch (error) {
        next(error);
    }
}

export {
    createUser,
    getUsers
}