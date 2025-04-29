import { NextFunction, Request, Response } from "express";
import { BodyCreateUser } from "../../../dto/user.dto";
import { prismaClient } from "../../../config/db";
import bcrypt from 'bcryptjs'

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
        const { password, username, name, role  } = req.body
        const hashed = await bcrypt.hash(password, 10)
        await prismaClient.users.create(
            { 
                data: 
                { 
                    password: hashed, username, name, role: role ?? 'employee' 
                } 
            }
        )
        res.status(200).json({ status: 200, message: "User created successfully" });
        return;
    } catch (error) {
        next(error);
    }
}

export {
    createUser,
}