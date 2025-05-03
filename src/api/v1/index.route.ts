import { Request, Response, Router } from 'express';
import authRouter from './auth/auth.route';
import categoryRouter from './category/category.route';
import usersRouter from './users/users.route';
import storeRouter from './store/store.route';
import productRouter from './product/product.route';
import stockRouter from './stock/stock.route';

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
        path: '/user',
        route: usersRouter,
    },
    {
        path: '/category',
        route: categoryRouter,
    },
    {
        path: '/store',
        route: storeRouter,
    },
    {
        path: '/product',
        route: productRouter,
    },
    {
        path: '/stock',
        route: stockRouter,
    }
]

apiRoutes.forEach((route) => {
    apiV1.use(route.path, route.route);
});

export default apiV1;