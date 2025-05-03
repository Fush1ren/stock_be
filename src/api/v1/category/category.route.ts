import { Router } from 'express';
import { verifyToken } from '../../../middleware';
import { createCategory } from './category.controller';

const categoryRouter = Router();

categoryRouter.post('/', verifyToken, createCategory);
categoryRouter.get('/', verifyToken, createCategory); // Assuming you want to use the same controller for GET as well

export default categoryRouter;