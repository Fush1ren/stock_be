import { Router } from 'express';
import { createCategory, getAllCategory } from './category.controller';
import { verifyToken } from '../../../middleware';

const categoryRoute = Router();

categoryRoute.get('/', verifyToken, getAllCategory);
categoryRoute.post('/', verifyToken, createCategory);

export default categoryRoute;