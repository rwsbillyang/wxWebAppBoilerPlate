
import { f7 } from "framework7-react";
import { Router } from "framework7/types";
import { ComponentFunction } from "framework7/types/modules/component/component";

import { BrowserHistorySeparator, DEBUG } from "@/config";
import ErrorPage from "@/pages/auxiliary/Error";

import { CorpParams, LoginParam, LoginType } from "@/user/AuthData";
import WxOauthLoginPageWork from "@/user/WxOauthLoginPageWork";
import WxOauthLoginPageOA from "@/user/WxOauthLoginPageOA";
import { WebAppHelper } from "@/user/WebAppHelper";
import { WxAuthHelper, WxGuestAuthHelper } from '@/user/WxOauthHelper';
import UserPwdLoginPage from "@/user/UserPwdLoginPage";
import { PcShowQrcodePage } from "@/user/WxScanQrcodeLogin";




//https://forum.framework7.io/t/beforeleave-in-svelte/11107/4
export function beforeLeave(ctx: Router.RouteCallbackCtx) {
  if (ctx.app.data && ctx.app.data.dirty) {
    ctx.app.dialog.confirm('您的修改尚未保存，确定要放弃修改吗？',
      () => { ctx.app.data.dirty = false; ctx.resolve() }, //ok
      () => {//cancel
        ctx.reject()
        const url = BrowserHistorySeparator + ctx.from.url
        history.pushState(history.state, '', url);
        ctx.router.allowPageChange = true;
      })
  } else
    ctx.resolve()
}


export function securedRoute(name: string, path: string, component: ComponentFunction | Function | object) {
  // function securedRoute(name, path, component) {
   return {
    name, path, id: name, async(ctx: Router.RouteCallbackCtx) { checkAdmin(ctx, component) }
  }
}
 
//将设置CorpParams，并从中遍历获取LoginParam
function checkAdmin(ctx: Router.RouteCallbackCtx, component: ComponentFunction | Function | object) {
  if(DEBUG) console.log("securedRoute checkAdmin call checkAndSetCorpParams")
  checkAndSetCorpParams(ctx, ["/wx/admin/"])
 
  const toPath = ctx.to.path
  const isWxWorkApp = WebAppHelper.isWxWorkApp()

  const loginType = ctx.to.query.loginType

  let loginComponent: ((props: any) => JSX.Element) | React.FC<LoginParam>
  if (loginType === LoginType.ACCOUNT) {
    loginComponent = UserPwdLoginPage
  } else if (loginType === LoginType.SCAN_QRCODE) {
    loginComponent = PcShowQrcodePage
  } else if (loginType === LoginType.MOBILE) {
    loginComponent = UserPwdLoginPage //暂时也使用账户密码登录
             } else {
    loginComponent = isWxWorkApp ? WxOauthLoginPageWork : WxOauthLoginPageOA
  }


  //从拦截的链接中获取 从url中提取query参数
  const loginParam: LoginParam = { from: ctx.to.url, needUserInfo: false, authStorageType: (ctx.to.query.authStorageType ? +(ctx.to.query.authStorageType) : undefined) } 
  const p =  { "props": loginParam}

  if (toPath.indexOf("/super/admin/") >= 0) {
    if (WxAuthHelper.authBeanHasRole(["root"]))
      ctx.resolve({ "component": component }) //已登录
    else {
      if(DEBUG) console.log("securedRoute checkAdmin: not logined, to LoginPage from " + ctx.to.url)
      ctx.resolve({ "component": loginComponent }, p)
             }
  } else if (toPath.indexOf("/admin/") >= 0) {
    if (WxAuthHelper.authBeanHasRole(["root", "admin"]))
      ctx.resolve({ "component": component }) //已登录
    else {
      if (DEBUG) console.log("securedRoute checkAdmin: not logined, to LoginPage from " + ctx.to.url)
      ctx.resolve({ "component": loginComponent },p)
    }
  } else if (toPath.indexOf("/dev/") >= 0) {
    if (WxAuthHelper.authBeanHasRole( ["dev"]))
      ctx.resolve({ "component": component }) //已登录
    else {
      if (DEBUG) console.log("securedRoute checkAdmin: not logined, to LoginPage from " + ctx.to.url)
      ctx.resolve({ "component": loginComponent }, p)
    }
  } else if (toPath.indexOf("/user/") >= 0) {
    if (WxAuthHelper.authBeanHasRole( ["root", "admin", "user"]) || WxAuthHelper.isAuthenticated())
      ctx.resolve({ "component": component }) //已登录
    else {
      if (DEBUG) console.log("securedRoute checkAdmin: not logined, to LoginPage from " + ctx.to.url)
      ctx.resolve({ "component": loginComponent }, p)
    }
  } else {//使用了secureRoute保护，但路径中无admin
         if (WxGuestAuthHelper.isAuthenticated() || WxAuthHelper.isAuthenticated()) {
             ctx.resolve({ "component": component })
         } else {
      if(DEBUG) console.log("securedRoute: not login, jump to=" + ctx.to.url)
             let owner = ctx.to.params["uId"]//用于查询后端文章属主需不需要获取用户信息
 
             //只有newsDetail待定（根据用户配置确定），其它都不需要获取用户信息（关注时自动获取，其它情况不必要）
      loginParam.owner = owner
      ctx.resolve({"component": loginComponent }, { "props": loginParam })
     }
   }

 }
 


//deprecated
// export function needAdmin(ctx: Router.RouteCallbackCtx) {
//   if (DEBUG) console.log("beforeEnter needAdmin")

//   checkAndSetCorpParams(ctx, ["/wx/admin/"])

//   if (ctx.to.path.indexOf("/wx/admin/") >= 0) { //wx管理后台单独处理
//     const bean = WxAuthHelper.getAuthBean()
//     if (bean?.uId && bean.token && (WxAuthHelper.authBeanHasRole(bean, "admin") || WxAuthHelper.authBeanHasRole(bean, "root")))
//       ctx.resolve()
//     else {
//       ctx.reject()
//         //admin情况下，没有指定owner，也没指定openId，WxOauthLoginPageOA直接跳转到获取用户信息的授权认证
//         ctx.router.navigate({ name:  'webAdminLogin'  }, { props: { from: ctx.to.url } });
//     }
//   } else {
//     //若还没有CorpParams，则解析url参数，设置它；若已存在则忽略

//     const isWxWorkApp = WebAppHelper.isWxWorkApp()
//     const isNeedAdmin = ctx.to.path.indexOf("/admin/") >= 0
//     if (isNeedAdmin) {
//       const isAuthenticated = WxAuthHelper.isAuthenticated()
//       if (isAuthenticated) {
//         ctx.resolve()
//       } else {
//         ctx.reject()
//         //admin情况下，没有指定owner，也没指定openId，WxOauthLoginPageOA直接跳转到获取用户信息的授权认证
//         ctx.router.navigate({ name: isWxWorkApp ? 'login' : 'login2' }, { props: { from: ctx.to.url } });
//       }
//     } else {
//       if (WxGuestAuthHelper.isAuthenticated() || WxAuthHelper.isAuthenticated()) {
//         ctx.resolve()
//       } else {
//         if (DEBUG) console.log("beforeEnter needAdmin: not login, jump to=" + ctx.to.url)
//         let owner = ctx.to.params["uId"]//用于查询后端文章属主需不需要获取用户信息

//         ctx.reject()
//         //非admin页面：只有newsDetail待定（传递了ownerOpenId和未定的needUserInfo，WxOauthLoginPageOA将请求后端根据用户配置确定），其它都不需要获取用户信息（关注时自动获取，其它情况不必要）
//         ctx.router.navigate({ name: isWxWorkApp ? 'login' : 'wxoaLogin' }, { props: { from: ctx.to.url, needUserInfo: ctx.to.name.indexOf("newsDetail") >= 0 ? undefined : false, owner: owner } });
//       }
//     }
//   }
// }

export function checkAndSetCorpParams(ctx: Router.RouteCallbackCtx, exceptions: string[]) {
  const toUrl = ctx.to.url
  if(DEBUG) console.log("checkAndSetCorpParams call getCorpParams! toUrl="+toUrl)
      //若还没有CorpParams，则解析url参数，设置它；若已存在则忽略
  //对于exceptions中的例外路径，则设置一个fake CorpParams
  const p = WebAppHelper.getCorpParams()
      if (!p) {
        const query: any = f7.utils.parseUrlQuery(toUrl)
    const params: CorpParams = { corpId: query.corpId, agentId: query.agentId, suiteId: query.suiteId, appId: query.appId }

    if ((!query.corpId || !query.agentId) && !query.suiteId && !query.appId){
      //wx admin not need SetCorpParams
      if (exceptions && exceptions.length > 0) {
        const path = ctx.to.path
        for (let e in exceptions) {
          if (path.indexOf(e) >= 0) {
            const fakeParams: CorpParams = { appId: "admin" }
            if (DEBUG) console.log("set fake CorpParams done")
            WebAppHelper.setCorpParams(fakeParams)//设置一个fake CorpParams
            return
          }
        }
      }

      if(DEBUG) console.log("no CorpParams in url and sessionStorage:, toUrl="+toUrl)
      ctx.resolve({ "component": ErrorPage }, { "props": { msg: "no CorpParams in toUrl="+toUrl } })
    }else{
        WebAppHelper.setCorpParams(params)
        if(DEBUG) console.log("setCorpParams done")
        }
      }
}



//https://forum.framework7.io/t/issue-with-f7-vue-routes-component-async-at-same-time-doesnt-works/4469/8
// export function securedRoute2(name: string, path: string, component: ComponentFunction | Function | object) {
//   return {
//     name, path, id: name,
//     async(ctx: Router.RouteCallbackCtx) {

//       checkAndSetCorpParams(ctx, ctx.to.url)

//       const isNeedAdmin = ctx.to.path.indexOf("/admin/") >= 0
//       if (isNeedAdmin) {
//         const isLogined = WxAuthHelper.isAuthenticated()
//         if (isLogined) {
//           //console.log("securedRoute: admin logined, jump to " + ctx.to.url)
//           ctx.resolve({ "component": component })
//         } else {
//           //console.log("securedRoute: not logined, jump to WxOAuthLoginPage from " + ctx.to.url)
//           ctx.resolve({
//             "component": WxOauthLoginPageWork
//           }, {
//             "props": { from: ctx.to.url }
//           })
//         }
//       } else {
//         if (WxGuestAuthHelper.isAuthenticated()) {
//           //console.log("securedRoute: guest logined, jump to " + ctx.to.url)
//           ctx.resolve({ "component": component })
//         } else {
//           //console.log("securedRoute: guest not login, from " + ctx.to.url)
//           ctx.resolve({ "component": WxOauthLoginPageWork }, { "props": { from: ctx.to.url } })
//         }
//       }
//     }
//   }
// }
