import { Router } from 'express';
import { verifyToken } from '../../../middleware';
import { createUser } from './users.controller';

const usersRouter = Router();

usersRouter.post('/', verifyToken, createUser);

export default usersRouter;