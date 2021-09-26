
import NotFoundPage from '@/pages/404';
import About from '@/pages/About';
import DemoWxWorkAdmin from '@/pages/demo/DemoWxWorkAdmin';
import HomePage from '@/pages/Home';

import WxOAuthNotifyOa from '@/pages/user/WxOAuthNotifyOa';
import WxOAuthLoginPage from '@/pages/user/WxOAuthLoginPage';
import WxOAuthNotifyWork from '@/pages/user/WxOAuthNotifyWork';
import { Router } from 'framework7/types';
import { securedRoute } from './routesHelper';
import ErrorPage from '@/pages/Error';

const needSecureRoutes: Router.RouteParameters[] = [
  securedRoute("demoWxAdmin", "/admin/demo/wxwork", DemoWxWorkAdmin)
]


const freeRoutes: Router.RouteParameters[] = [
  {
    name: 'login',
    path: '/wx/login',
    component: WxOAuthLoginPage,
    options: {
      history: false,
      browserHistory: false,
      clearPreviousHistory: true
    }
  },
  {
    name: "wxworkAuthNotify",
    path: '/wxwork/authNotify', //前端若是SPA，通知路径可能需要添加browserHistorySeparator
    component: WxOAuthNotifyWork,
    options: {
      history: false,
      browserHistory: false,
      clearPreviousHistory: true
    }
  },
  {
    name: "wxoaAuthNotify",
    path: '/wxoa/authNotify', //前端若是SPA，通知路径可能需要添加browserHistorySeparator
    component: WxOAuthNotifyOa,
    options: {
      history: false,
      browserHistory: false,
      clearPreviousHistory: true
    }
  },
  {
    name: "about",
    path: '/about',
    component: About,
  },
  {
    name:'error',
    path: '/error',
    component: ErrorPage,
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

const routes =  needSecureRoutes.concat(freeRoutes);
export default routes




