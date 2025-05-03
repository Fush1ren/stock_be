import { Router } from "express";
import { verifyToken } from '../../../middleware';
import { createStockIn, getStockIn } from "./stock.controller";

const stockRouter = Router();

stockRouter.post('/stock-in', verifyToken, createStockIn);
stockRouter.get('/stock-in', verifyToken, getStockIn);


export default stockRouter;