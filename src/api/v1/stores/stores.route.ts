import { Router } from 'express';
import { verifyToken } from '../../../middleware';
import { createStore } from './stores.controller';

const storesRouter = Router();

storesRouter.post('/', verifyToken, createStore);

export default storesRouter;