import { Request, Response, Router } from 'express';
import { APIRoute } from '../types';
import userRouter from './user/user.route';
import authRouter from './auth/auth.route';
import roleRouter from './role/role.route';
import fileRouter from './file/file.route';
import storeRoute from './store/store.route';
import unitRoute from './unit/unit.route';
import brandRouter from './brand/brand.route';
import categoryRoute from './category/category.route';
import productRoute from './product/product.route';
import stockRoute from './stock/stock.route';

const apiV1 = Router();

apiV1.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 200,
        message: 'API V1 is running',
    });
})

const apiRoutes: APIRoute[] = [
    {
        path: '/user',
        route: userRouter,
    },
    {
        path: '/auth',
        route: authRouter,
    },
    {
        path: '/role',
        route: roleRouter,
    },
    {
        path: '/file',
        route: fileRouter,
    },
    {
        path: '/store',
        route: storeRoute,
    },
    {
        path: '/unit',
        route: unitRoute,
    },
    {
        path: '/brand',
        route: brandRouter,
    },
    {
        path: '/category',
        route: categoryRoute,
    },
    {
        path: '/product',
        route: productRoute,
    },
    {
        path: 'stock',
        route: stockRoute,
    }
]

apiRoutes.forEach((route) => {
    apiV1.use(route.path, route.route);
});

export default apiV1;