import { Router } from 'express';
import { verifyToken } from '../../../middleware';
import { createUser, getUsers } from './users.controller';

const usersRouter = Router();

usersRouter.post('/', verifyToken, createUser);
usersRouter.get('/', verifyToken, getUsers);


export default usersRouter;