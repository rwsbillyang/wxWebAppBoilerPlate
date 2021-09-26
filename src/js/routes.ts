import { Router } from 'framework7/types';

import NotFoundPage from '@/pages/404';
import About from '@/pages/About';
import HomePage from '@/pages/Home';
import ErrorPage from '@/pages/Error';


import WxOAuthNotifyOa from '@/pages/user/WxOAuthNotifyOa';
import WxOAuthLoginPage from '@/pages/user/WxOAuthLoginPage';
import WxOAuthNotifyWork from '@/pages/user/WxOAuthNotifyWork';

import Feedback from '@/pages/Feedback';
import ContactKf from '@/pages/ContactKf';

import { securedRoute } from './routesHelper';


import DemoWxWorkAdmin from '@/pages/demo/DemoWxWorkAdmin';




const needSecureRoutes: Router.RouteParameters[] = [
  securedRoute("demoWxAdmin", "/admin/demo/wxwork", DemoWxWorkAdmin),
  securedRoute('feedback', '/admin/channel/feedback', Feedback),
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
    name: "contactKf",
    path: '/channel/ContactKf',
    component: ContactKf,
  },
  {
    name: "about",
    path: '/about',
    component: About,
  },
  {
    name:'error',
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

export default needSecureRoutes.concat(freeRoutes);




