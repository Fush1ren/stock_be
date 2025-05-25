import { Router } from 'express';
import { createUnit, getAllUnit } from './unit.controller';
import { verifyToken } from '../../../middleware';

const unitRoute = Router();

unitRoute.get('/', verifyToken, getAllUnit);
unitRoute.post('/', verifyToken, createUnit);

export default unitRoute;