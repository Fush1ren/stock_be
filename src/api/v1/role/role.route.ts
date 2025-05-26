import { Router } from 'express';
import { createRole, getAllRole } from './role.controller';
import { verifyToken } from '../../../middleware';

const roleRouter = Router();

roleRouter.post('/', verifyToken, createRole);
roleRouter.get('/', verifyToken, getAllRole); 
// roleRouter.post('/', verifyToken, createRole);

export default roleRouter;