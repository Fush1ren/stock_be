import { Router } from 'express';
import { createStore, deleteStore, getAllStore, updateStore } from './store.controller';
import { verifyToken } from '../../../middleware';

const storeRoute = Router();

storeRoute.get('/', verifyToken, getAllStore);
storeRoute.post('/', verifyToken, createStore);
storeRoute.put('/', verifyToken, updateStore); // Assuming updateStore is similar to createStore
storeRoute.delete('/', verifyToken, deleteStore); // Assuming deleteStore is similar to updateStore

export default storeRoute;