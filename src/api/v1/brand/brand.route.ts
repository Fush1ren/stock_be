import { Router } from 'express';
import { createBrand, getAllBrand } from './brand.controller';
import { verifyToken } from '../../../middleware';

const brandRouter = Router();

brandRouter.get('/', verifyToken, getAllBrand);
brandRouter.post('/', verifyToken, createBrand);

export default brandRouter;