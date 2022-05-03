import { securedRoute } from '@/js/routesHelper';
import { Router } from 'framework7/types';
import UserPwdLoginPage from './UserPwdLoginPage';
import WxOauthLoginPageOA from './WxOauthLoginPageOA';
import WxOauthLoginPageWork from './WxOauthLoginPageWork';
import WxOauthNotifyOA from './WxOauthNotifyOA';
import WxOauthNotifyWork from './WxOauthNotifyWork';
import { WxScanQrcodeLoginDonePage, WxScanQrcodeLoginConfirmPage, PcShowQrcodePage } from './WxScanQrcodeLogin';


export const wxUserLoginRoutes: Router.RouteParameters[] = [
  {
    name: 'showQrcode',
    path: '/wx/scanLogin/show',
    component: PcShowQrcodePage
  },
  {
    name: 'confirmScanLogin',
    path: '/wx/scanLogin/confirm',
    component: WxScanQrcodeLoginConfirmPage
  },
  securedRoute('scanQrcodeLoginDone', '/wx/scanLogin/admin/done', WxScanQrcodeLoginDonePage),
  
  {
    name: 'webAdminLogin',
    path: '/wx/webAdmin/login',
    component: UserPwdLoginPage,
    options: {
      history: false,
      browserHistory: false,
      clearPreviousHistory: true
    }
  },
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
]

