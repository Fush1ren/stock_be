import { Router } from 'express';
import { verifyToken } from '../../../middleware';
import { createItem } from './item.controller';

const itemRouter = Router();

itemRouter.post('/', verifyToken, createItem);

export default itemRouter;