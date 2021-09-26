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

import DemoWxWorkAdmin from '@/pages/demo/DemoWxWorkAdmin';
import RoutableTabs from '@/pages/demo/RoutableTabs';
import Tab1 from '@/pages/demo/Tab1';
import Tab2 from '@/pages/demo/Tab2';
import Tab3 from '@/pages/demo/Tab3';
import Tab4 from '@/pages/demo/Tab4';

import LoginPage from '@/pages/user/OALoginPage';
import { securedRoute } from './routesHelper';




const routes: Router.RouteParameters[] = [
  {
    path: '/admin/tab',
    component: RoutableTabs,
    tabs: [
      securedRoute('tab1', '/tab1', Tab1),
      securedRoute('tab2', '/tab2', Tab2),
      securedRoute('tab3', '/tab3', Tab3),
      securedRoute('tab4', '/tab4', Tab4),
    ]
  },

  securedRoute('feedback', '/admin/feedback', Feedback),
  securedRoute("demoWxAdmin", "/admin/demo/wxwork", DemoWxWorkAdmin),

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
    name: 'login2',
    path: '/wx/login2',
    component: LoginPage,
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

export default routes



