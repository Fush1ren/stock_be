import { Router } from 'express';
import { createBrand, getAllBrand, getBrandDropdown } from './brand.controller';
import { verifyToken } from '../../../middleware';

const brandRouter = Router();

brandRouter.get('/', verifyToken, getAllBrand);
brandRouter.get('/dropdown', verifyToken, getBrandDropdown);
brandRouter.post('/', verifyToken, createBrand);

export default brandRouter;