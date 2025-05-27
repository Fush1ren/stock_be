import { Router } from 'express';
import { createRole, deleteRole, getAllRole, getRoleDropdown, updateRole } from './role.controller';
import { verifyToken } from '../../../middleware';

const roleRouter = Router();

roleRouter.post('/', verifyToken, createRole);
roleRouter.get('/', verifyToken, getAllRole); 
roleRouter.get('/dropdown', verifyToken, getRoleDropdown); // Assuming getAllRole can be used for dropdown as well
roleRouter.put('/', verifyToken, updateRole); // Assuming updateRole is similar to createRole
roleRouter.delete('/', verifyToken, deleteRole); // Assuming deleteRole is similar to updateRole

export default roleRouter;