import { Router } from 'express';
import { createProduct, getAllProducts } from './product.controller';
import { verifyToken } from '../../../middleware';

const productRoute = Router();

productRoute.get('/', verifyToken, getAllProducts);
productRoute.post('/', verifyToken, createProduct);

export default productRoute;