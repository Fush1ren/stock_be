import { Router } from 'express';
import { createProduct, getAllProducts, updateProduct } from './product.controller';
import { verifyToken } from '../../../middleware';
import { deleteBrand } from '../brand/brand.controller';

const productRoute = Router();

productRoute.get('/', verifyToken, getAllProducts);
productRoute.post('/', verifyToken, createProduct);
productRoute.put('/:id', verifyToken, updateProduct); // Assuming updateProduct is similar to createProduct
productRoute.delete('/', verifyToken, deleteBrand);

export default productRoute;