import { Router } from 'express';
import { createStockIn, createStockMutation, createStockOut, createStoreStock, createWarehouseStock, getAllStocksIn, getAllStocksMutation, getAllStocksOut, getAllStoreStocks, getAllWarehouseStocks, getStockInNextCode, getStockMutationNextCode, getStockOutNextCode } from './stock.controller';
import { verifyToken } from '../../../middleware';

const stockRoute = Router();

stockRoute.get('/', verifyToken, getAllStoreStocks);
stockRoute.get('/warehouse', verifyToken, getAllWarehouseStocks);
stockRoute.get('/in', verifyToken, getAllStocksIn);
stockRoute.get('/out', verifyToken, getAllStocksOut);
stockRoute.get('/mutation', verifyToken, getAllStocksMutation);
stockRoute.get('/in/next-index', verifyToken, getStockInNextCode); // Assuming this is for next index
stockRoute.get('/out/next-index', verifyToken, getStockOutNextCode); // Assuming this is for next index for store stocks
stockRoute.get('/mutation/next-index', verifyToken, getStockMutationNextCode); // Assuming this is for next index for store stocks

stockRoute.post('/', verifyToken, createStoreStock);
stockRoute.post('/warehouse', verifyToken, createWarehouseStock);
stockRoute.post('/in', verifyToken, createStockIn);
stockRoute.post('/out', verifyToken, createStockOut);
stockRoute.post('/mutation', verifyToken, createStockMutation);

export default stockRoute;