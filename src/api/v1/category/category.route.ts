import { Router } from 'express';
import { createCategory, getAllCategory, getCategoryDropdown } from './category.controller';
import { verifyToken } from '../../../middleware';

const categoryRoute = Router();

categoryRoute.get('/', verifyToken, getAllCategory);
categoryRoute.get('/dropdown', verifyToken, getCategoryDropdown);
categoryRoute.post('/', verifyToken, createCategory);

export default categoryRoute;