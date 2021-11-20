import { Router } from 'framework7/types';

import NotFoundPage from '@/pages/auxiliary/404';
import About from '@/pages/auxiliary/About';
import HomePage from '@/pages/Home';
import ErrorPage from '@/pages/auxiliary/Error';

import Feedback from '@/pages/auxiliary/Feedback';
import ContactKf from '@/pages/auxiliary/ContactKf';

import { securedRoute } from './routesHelper';
import WxOauthLoginPageWork from '@/user/WxOauthLoginPageWork';

import RoutableTabs from '@/pages/demo/RoutableTabs';
import WxOauthLoginPageOA from '@/user/WxOauthLoginPageOA';
import WxOauthNotifyWork from '@/user/WxOauthNotifyWork';

import DemoWxWorkAdmin from '@/pages/demo/DemoWxWorkAdmin';
import Tab1 from '@/pages/demo/Tab1';
import Tab2 from '@/pages/demo/Tab2';
import Tab3 from '@/pages/demo/Tab3';
import Tab4 from '@/pages/demo/Tab4';
import WxOauthNotifyOA from '@/user/WxOauthNotifyOA';


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
    component: WxOauthLoginPageWork,
    options: {
      history: false,
      browserHistory: false,
      clearPreviousHistory: true
    }
  },
  {
    name: 'wxoaLogin',
    path: '/wxoa/login',
    component: WxOauthLoginPageOA,
    options: {
      history: false,
      browserHistory: false,
      clearPreviousHistory: true
    }
  },
  {
    name: "wxworkAuthNotify",
    path: '/wxwork/authNotify', //前端若是SPA，通知路径可能需要添加browserHistorySeparator
    component: WxOauthNotifyWork,
    options: {
      history: false,
      browserHistory: false,
      clearPreviousHistory: true
    }
  },
  {
    name: "wxoaAuthNotify",
    path: '/wxoa/authNotify', //前端若是SPA，通知路径可能需要添加browserHistorySeparator
    component: WxOauthNotifyOA,
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



