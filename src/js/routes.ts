
import NotFoundPage from '@/pages/404';
import About from '@/pages/About';
import HomePage from '@/pages/Home';
import { Router } from 'framework7/types';

const needSecureRoutes: Router.RouteParameters[] = [

]


const freeRoutes: Router.RouteParameters[] = [
  {
    name: "about",
    path: '/about',
    component: About,
  },
  {
    name:'error',
    path: '/error',
    component: Error,
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


export default needSecureRoutes.concat(freeRoutes);




