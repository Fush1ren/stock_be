import { Router } from 'express';
import { createCategory, deleteCategory, getAllCategory, getCategoryDropdown, updateCategory } from './category.controller';
import { verifyToken } from '../../../middleware';

const categoryRoute = Router();

categoryRoute.get('/', verifyToken, getAllCategory);
categoryRoute.get('/dropdown', verifyToken, getCategoryDropdown);
categoryRoute.post('/', verifyToken, createCategory);
categoryRoute.put('/', verifyToken, updateCategory); // Assuming updateCategory is similar to createCategory
categoryRoute.delete('/', verifyToken, deleteCategory); // Assuming deleteCategory is similar to updateCategory

export default categoryRoute;