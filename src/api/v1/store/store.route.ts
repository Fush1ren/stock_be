import { Router } from 'express';
import { createStore, getAllStore } from './store.controller';
import { verifyToken } from '../../../middleware';

const storeRoute = Router();

storeRoute.get('/', verifyToken, getAllStore);
storeRoute.post('/', verifyToken, createStore);

export default storeRoute;