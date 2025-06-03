import { Router } from 'express';
import { createProduct, deleteProduct, getAllProducts, getNextIndex, getProductById, getProductDropdown, updateProduct } from './product.controller';
import { verifyToken } from '../../../middleware';

const productRoute = Router();

productRoute.get('/', verifyToken, getAllProducts);
productRoute.get('/next-index', verifyToken, getNextIndex);
productRoute.get('/dropdown', verifyToken, getProductDropdown);
productRoute.get('/:id', verifyToken, getProductById);
productRoute.post('/', verifyToken, createProduct);
productRoute.put('/:id', verifyToken, updateProduct); // Assuming updateProduct is similar to createProduct
productRoute.delete('/', verifyToken, deleteProduct);

export default productRoute;