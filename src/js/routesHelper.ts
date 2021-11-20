
import { f7 } from "framework7-react";
import { Router } from "framework7/types";
import { ComponentFunction } from "framework7/types/modules/component/component";




import { BrowserHistorySeparator, DEBUG } from "@/config";
import ErrorPage from "@/pages/auxiliary/Error";

import { CorpParams } from "@/user/AuthData";
import WxOauthLoginPageWork from "@/user/WxOauthLoginPageWork";
import WxOauthLoginPageOA from "@/user/WxOauthLoginPageOA";
import { WebAppHelper } from "@/user/WebAppHelper";
import { WxAuthHelper, WxGuestAuthHelper } from '@/user/WxOauthHelper';



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
 
function checkAdmin(ctx: Router.RouteCallbackCtx, component: ComponentFunction | Function | object) {
  if(DEBUG) console.log("securedRoute checkAdmin call checkAndSetCorpParams")
       checkAndSetCorpParams(ctx, ctx.to.url)
 
  const isWxWorkApp = WebAppHelper.isWxWorkApp()
       const isNeedAdmin = ctx.to.path.indexOf("/admin/") >= 0
       if (isNeedAdmin) {
             const isAuthenticated = WxAuthHelper.isAuthenticated()
             if (isAuthenticated) {
                 ctx.resolve({ "component": component })
             } else {
      if(DEBUG) console.log("securedRoute checkAdmin: not logined, to LoginPage from " + ctx.to.url)
                 ctx.resolve({
        "component": isWxWorkApp ? WxOauthLoginPageWork : WxOauthLoginPageOA
                 }, {
                   "props": { from: ctx.to.url, needUserInfo: false, silentLogin: false }
                 })
             }
       } else {
         if (WxGuestAuthHelper.isAuthenticated() || WxAuthHelper.isAuthenticated()) {
             ctx.resolve({ "component": component })
         } else {
      if(DEBUG) console.log("securedRoute: not login, jump to=" + ctx.to.url)
             let owner = ctx.to.params["uId"]//用于查询后端文章属主需不需要获取用户信息
 
             //只有newsDetail待定（根据用户配置确定），其它都不需要获取用户信息（关注时自动获取，其它情况不必要）
      ctx.resolve({
        "component": isWxWorkApp ? WxOauthLoginPageWork : WxOauthLoginPageOA
      }, { "props": { from: ctx.to.url, needUserInfo: ctx.to.name.indexOf("newsDetail")>=0? undefined: false, owner: owner } })
     }
   }
 }
 



export function needAdmin(ctx: Router.RouteCallbackCtx) {
  if(DEBUG) console.log("beforeEnter needAdmin")
  //若还没有CorpParams，则解析url参数，设置它；若已存在则忽略
      checkAndSetCorpParams(ctx, ctx.to.url)

  const isWxWorkApp = WebAppHelper.isWxWorkApp()
      const isNeedAdmin = ctx.to.path.indexOf("/admin/") >= 0
      if (isNeedAdmin) {
    const isAuthenticated = WxAuthHelper.isAuthenticated()
    if (isAuthenticated) {
      ctx.resolve()
        } else {
      ctx.reject()
      //admin情况下，没有指定owner，也没指定openId，WxOauthLoginPageOA直接跳转到获取用户信息的授权认证
      ctx.router.navigate({ name: isWxWorkApp ? 'login' : 'login2' }, { props: { from: ctx.to.url } });
        }
      } else {
    if (WxGuestAuthHelper.isAuthenticated() || WxAuthHelper.isAuthenticated()) {
      ctx.resolve()
        } else {
      if(DEBUG) console.log("beforeEnter needAdmin: not login, jump to=" + ctx.to.url)
      let owner = ctx.to.params["uId"]//用于查询后端文章属主需不需要获取用户信息

      ctx.reject()
      //非admin页面：只有newsDetail待定（传递了ownerOpenId和未定的needUserInfo，WxOauthLoginPageOA将请求后端根据用户配置确定），其它都不需要获取用户信息（关注时自动获取，其它情况不必要）
      ctx.router.navigate({ name: isWxWorkApp ? 'login' : 'login2' }, { props: { from: ctx.to.url, needUserInfo: ctx.to.name.indexOf("newsDetail")>=0 ? undefined : false, owner: owner } });
    }
  }
}

export function checkAndSetCorpParams(ctx: Router.RouteCallbackCtx, toUrl: string){
  if(DEBUG) console.log("checkAndSetCorpParams call getCorpParams! toUrl="+toUrl)
      //若还没有CorpParams，则解析url参数，设置它；若已存在则忽略
  const p = WebAppHelper.getCorpParams()
      if (!p) {
        const query: any = f7.utils.parseUrlQuery(toUrl)
    const params: CorpParams = { corpId: query.corpId, agentId: query.agentId, suiteId: query.suiteId, appId: query.appId }

    if ((!query.corpId || !query.agentId) && !query.suiteId && !query.appId){
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
