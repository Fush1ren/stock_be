import { Router } from 'express';
import { createUser, getAllUser, updateUser } from './user.controller';
// import { verifyToken } from '../../../middleware';
import multer from 'multer';

const upload = multer();

const userRouter = Router();

// usersRouter.get('/', verifyToken, getUsers);
userRouter.get('/', getAllUser);
userRouter.post('/', upload.single('photo'), createUser);
userRouter.put('/', updateUser)

export default userRouter;