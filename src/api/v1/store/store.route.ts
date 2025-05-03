import { Router } from 'express';
import { verifyToken } from '../../../middleware';
import { createStore, getStore } from './store.controller';

const storeRouter = Router();

storeRouter.post('/', verifyToken, createStore);
storeRouter.get('/', verifyToken, getStore); // Assuming you want to use the same controller for GET as well

export default storeRouter;