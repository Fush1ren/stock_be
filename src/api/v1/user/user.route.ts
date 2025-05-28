import { Router } from 'express';
import { createUser, getAllUser, updateUser } from './user.controller';
// import { verifyToken } from '../../../middleware';
import multer from 'multer';
import { verifyToken } from '../../../middleware';

const upload = multer();

const userRouter = Router();

userRouter.get('/', verifyToken, getAllUser);
userRouter.post('/', verifyToken, upload.single('photo'), createUser);
userRouter.put('/:id', verifyToken, updateUser)
userRouter.delete('/', verifyToken, updateUser); 

export default userRouter;