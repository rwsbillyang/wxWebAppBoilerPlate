
import { f7 } from "framework7-react";
import { Router } from "framework7/types";
import { ComponentFunction } from "framework7/types/modules/component/component";

import { WxAuthHelper, WxGuestAuthHelper } from '@/pages/user/wxOAuthHelper';

import { isWxWorkMode } from '@/config';


import { BrowserHistorySeparator } from "@/config";
import { CorpParams } from "@/pages/user/authData";

import ErrorPage from "@/pages/Error";
import WxOAuthLoginPage from "@/pages/user/WxOAuthLoginPage";
import OALoginPage from "@/pages/user/OALoginPage";




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
     name, path, id: name,
     //async(ctx: Router.RouteCallbackCtx) {
       async(ctx) {
 
       checkAndSetCorpParams(ctx, ctx.to.url)
 
       const isNeedAdmin = ctx.to.path.indexOf("/admin/") >= 0
       if (isNeedAdmin) {
             const isAuthenticated = WxAuthHelper.isAuthenticated()
             if (isAuthenticated) {
                 ctx.resolve({ "component": component })
             } else {
               console.log("securedRoute: not logined, to LoginPage from " + ctx.to.url)
                 ctx.resolve({
                  // "component": MockLoginPage //isWxWork? WxOAuthLoginPage : LoginPage
                  "component": isWxWorkMode? WxOAuthLoginPage : OALoginPage
                 }, {
                   "props": { from: ctx.to.url, needUserInfo: false, silentLogin: false }
                 })
             }
       } else {
         if (WxGuestAuthHelper.isAuthenticated() || WxAuthHelper.isAuthenticated()) {
             ctx.resolve({ "component": component })
         } else {
             //console.log("securedRoute: not login, jump to=" + ctx.to.url)
             let owner = ctx.to.params["uId"]//用于查询后端文章属主需不需要获取用户信息
 
             //只有newsDetail待定（根据用户配置确定），其它都不需要获取用户信息（关注时自动获取，其它情况不必要）
             if (ctx.to.name == "newsDetail") {
               ctx.resolve({ "component": isWxWorkMode? WxOAuthLoginPage : OALoginPage
             }, {"props": { from: ctx.to.url,  owner: owner } })
             }else{
               if(WxGuestAuthHelper.isAuthenticated()){ //其它页面，登录要求只需有openid，无需有userinfo
                 ctx.resolve({ "component": component })
               }else{
                 ctx.resolve({ "component": isWxWorkMode? WxOAuthLoginPage : OALoginPage
               }, {"props": { from: ctx.to.url, needUserInfo: false, owner: owner } })
               }
             }
         }
       }
     }
   }
 }
 

//https://forum.framework7.io/t/issue-with-f7-vue-routes-component-async-at-same-time-doesnt-works/4469/8
export function securedRoute2(name: string, path: string, component: ComponentFunction | Function | object) {
  return {
    name, path, id: name,
    async(ctx: Router.RouteCallbackCtx) {

      checkAndSetCorpParams(ctx, ctx.to.url)

      const isNeedAdmin = ctx.to.path.indexOf("/admin/") >= 0
      if (isNeedAdmin) {
        const isLogined = WxAuthHelper.isAuthenticated()
        if (isLogined) {
          console.log("securedRoute: admin logined, jump to " + ctx.to.url)
          ctx.resolve({ "component": component })
        } else {
          console.log("securedRoute: not logined, jump to WxOAuthLoginPage from " + ctx.to.url)
          ctx.resolve({
            "component": WxOAuthLoginPage
          }, {
            "props": { from: ctx.to.url }
          })
        }
      } else {
        if (WxGuestAuthHelper.isAuthenticated()) {
          console.log("securedRoute: guest logined, jump to " + ctx.to.url)
          ctx.resolve({ "component": component })
        } else {
          console.log("securedRoute: guest not login, from " + ctx.to.url)
          ctx.resolve({ "component": WxOAuthLoginPage }, { "props": { from: ctx.to.url } })
        }
      }
    }
  }
}

export function checkAndSetCorpParams(ctx: Router.RouteCallbackCtx, toUrl: string){
      //若还没有CorpParams，则解析url参数，设置它；若已存在则忽略
      const p = WxAuthHelper.getCorpParams()
      if (!p) {
        const query: any = f7.utils.parseUrlQuery(toUrl)
        const params: CorpParams = { corpId: query.corpId, agentId: query.agentId, suiteId: query.suiteId }
        if (params) WxAuthHelper.setCorpParams(params)
        else {
          console.log("no CorpParams in url and sessionStorage")
          ctx.resolve({ "component": ErrorPage }, { "props": { msg: "no CorpParams in url" } })
        }
      }
}

export function needAdmin(ctx: Router.RouteCallbackCtx) {
  const isAdmin = ctx.to.path.indexOf("/admin/") >= 0

  //若还没有CorpParams，则解析url参数，设置它；若已存在则忽略
  checkAndSetCorpParams(ctx, ctx.to.url)

  if (isAdmin ? WxAuthHelper.isAuthenticated() : WxGuestAuthHelper.isAuthenticated()) {
    ctx.resolve()
  } else {
    //console.log("not login, needAdmin: jump to: " + ctx.to.path + ",from=" + ctx.from.url)
    ctx.reject()
    ctx.router.navigate({ name: 'login' }, { props: { from: ctx.to.url } });
  }
}
