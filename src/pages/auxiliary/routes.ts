
import { Router } from 'framework7/types';
import HomePage from '../Home';
import NotFoundPage from './404';
import About from './About';
import ContactKf from './ContactKf';
import ErrorPage from './Error';

export const auxiliaryRoutes: Router.RouteParameters[] = [
    {
        name: "contactKf",
        path: '/contactKf',
        component: ContactKf,
      },
      {
        name: "about",
        path: '/about',
        component: About,
      },
      {
        name: 'error',
        path: '/error',
        component: ErrorPage, //若引用了错误的component，将导致构建route失败，从而影响路由，从而打不开页面
      },
      {
        name: "home",
        path: '/',
        component: HomePage,
      },

      {
        name: '404',
        path: '(.*)',
        component: NotFoundPage,
      },
]