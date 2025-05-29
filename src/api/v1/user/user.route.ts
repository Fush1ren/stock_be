import { Router } from 'express';
import { createUser, getAllUser, getUserProfile, updateUser, updateUserProfile } from './user.controller';
import multer from 'multer';
import { verifyToken } from '../../../middleware';

const upload = multer();

const userRouter = Router();

userRouter.get('/', verifyToken, getAllUser);
userRouter.get('/profile/:id', verifyToken, getUserProfile);
userRouter.post('/', verifyToken, upload.single('photo'), createUser);
userRouter.put('/:id', verifyToken, updateUser)
userRouter.put('/profile/:id', verifyToken, upload.single('photo'), updateUserProfile);
userRouter.delete('/', verifyToken, updateUser); 

export default userRouter;