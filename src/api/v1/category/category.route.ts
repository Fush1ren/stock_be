import { Router } from 'express';
import { verifyToken } from '../../../middleware';
import { createCategory, getCategory } from './category.controller';

const categoryRouter = Router();

categoryRouter.post('/', verifyToken, createCategory);
categoryRouter.get('/', verifyToken, getCategory); // Assuming you want to use the same controller for GET as well

export default categoryRouter;