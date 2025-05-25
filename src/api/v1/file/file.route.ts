import { Router } from 'express';
import { getFile } from './file.controller';
import { verifyToken } from '../../../middleware';

const fileRouter = Router();

fileRouter.get('/', verifyToken, getFile);

export default fileRouter;