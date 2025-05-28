import { Router } from 'express';
import { createStore, deleteStore, getAllStore, getStoreDropdown, updateStore } from './store.controller';
import { verifyToken } from '../../../middleware';

const storeRoute = Router();

storeRoute.get('/', verifyToken, getAllStore);
storeRoute.get('/dropdown', verifyToken, getStoreDropdown); // Assuming getAllStore can be used for dropdown as well
storeRoute.post('/', verifyToken, createStore);
storeRoute.put('/:id', verifyToken, updateStore); // Assuming updateStore is similar to createStore
storeRoute.delete('/', verifyToken, deleteStore); // Assuming deleteStore is similar to updateStore

export default storeRoute;