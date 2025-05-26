import { Router } from 'express';
import { createUnit, getAllUnit, getUnitDropdown } from './unit.controller';
import { verifyToken } from '../../../middleware';

const unitRoute = Router();

unitRoute.get('/', verifyToken, getAllUnit);
unitRoute.get('/dropdown', verifyToken, getUnitDropdown);
unitRoute.post('/', verifyToken, createUnit);

export default unitRoute;