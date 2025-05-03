import { Router } from 'express';
import { verifyToken } from '../../../middleware';
import { createProduct, getProduct } from './product.controller';

const productRouter = Router();

productRouter.post('/', verifyToken, createProduct);
productRouter.get('/', verifyToken, getProduct);


export default productRouter;