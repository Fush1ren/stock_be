import { Router } from "express";
import { refreshToken, login, register } from "../controllers/authController";
import { verifyToken } from "../middleware";
import { getUser } from "../controllers/userController";
import { createItem, getItem } from "../controllers/itemController";

const router = Router();

// Methode GET
router.get('/user', verifyToken, getUser);
router.get('/item', verifyToken, getItem);

// Methode POST
router.post('/auth/login', login);
router.post('/auth/refresh-token', refreshToken);
router.post('/user', register);
router.post('/item', verifyToken, createItem)


export default router;