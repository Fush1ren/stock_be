import { Router } from 'express';
import { verifyToken } from '../../../middleware';
import { createCategory } from './category.controller';

const categoryRouter = Router();

categoryRouter.post('/', verifyToken, createCategory);

export default categoryRouter;