import { Router } from 'express';
import { createRole } from './role.controller';
import { verifyToken } from '../../../middleware';

const roleRouter = Router();

roleRouter.post('/', verifyToken, createRole);

export default roleRouter;