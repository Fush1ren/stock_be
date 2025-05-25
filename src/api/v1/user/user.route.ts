import { Router } from 'express';
import { createUser, getAllUser } from './user.controller';
import { verifyToken } from '../../../middleware';
import multer from 'multer';

const upload = multer();

const userRouter = Router();

// usersRouter.get('/', verifyToken, getUsers);
userRouter.get('/', verifyToken, getAllUser);
userRouter.post('/', verifyToken, upload.single('photo'), createUser);

export default userRouter;