import { Request, Response, Router } from 'express';
import authRouter from './auth/auth.route';
import categoryRouter from './category/category.route';
import itemRouter from './item/item.route';
import usersRouter from './users/users.route';
import storesRouter from './stores/stores.route';

const apiV1 = Router();

apiV1.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 200,
        message: 'API V1 is running',
    });
})

const apiRoutes = [
    {
        path: '/auth',
        route: authRouter,
    },
    {
        path: '/users',
        route: usersRouter,
    },
    {
        path: '/category',
        route: categoryRouter,
    },
    {
        path: '/item',
        route: itemRouter,
    },
    {
        path: '/stores',
        route: storesRouter,
    }
]

apiRoutes.forEach((route) => {
    apiV1.use(route.path, route.route);
});

export default apiV1;