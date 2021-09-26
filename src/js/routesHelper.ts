
import { f7 } from "framework7-react";
import { Router } from "framework7/types";
import { ComponentFunction } from "framework7/types/modules/component/component";

import { BrowserHistorySeparator } from "@/config";
import { CorpParams } from "@/pages/user/authData";
import { WxAuthHelper, WxGuestAuthHelper } from "@/pages/user/wxOAuthHelper";
import WxOAuthLoginPage from "@/pages/user/WxOAuthLoginPage";


//https://forum.framework7.io/t/beforeleave-in-svelte/11107/4
export function beforeLeave(ctx: Router.RouteCallbackCtx) {
    if(ctx.app.data && ctx.app.data.dirty){
      ctx.app.dialog.confirm('您的修改尚未保存，确定要放弃修改吗？', 
      () => {ctx.app.data.dirty=false; ctx.resolve()}, //ok
      ()=>{//cancel
        ctx.reject()
        const url =  BrowserHistorySeparator + ctx.from.url
        history.pushState(history.state, '', url);
        ctx.router.allowPageChange = true;
      }) 
    }else
      ctx.resolve()
  }




//https://forum.framework7.io/t/issue-with-f7-vue-routes-component-async-at-same-time-doesnt-works/4469/8
export function securedRoute(name: string, path: string, component: ComponentFunction | Function | object) {
    return {
      name, path, id: name,
      async(ctx: Router.RouteCallbackCtx) {

        //若还没有CorpParams，则解析url参数，设置它；若已存在则忽略
        const p = WxAuthHelper.getCorpParams()
        if(!p){
          const query: any = f7.utils.parseUrlQuery(ctx.to.url)
          const params: CorpParams = {corpId: query.corpId, agentId: query.agentId, suiteId: query.suiteId}
          if(params) WxAuthHelper.setCorpParams(params)
          else{
            console.log("no CorpParams in url and sessionStorage")
            ctx.resolve({ "component": Error}, {"props": { msg: "no CorpParams in url" } })
          }
        }
        
        const isNeedAdmin = ctx.to.path.indexOf("/admin/") >= 0
        if (isNeedAdmin) {
              const isLogined = WxAuthHelper.isAuthenticated()
              if (isLogined) {
                  ctx.resolve({ "component": component })
              } else {
                  ctx.resolve({
                    "component": WxOAuthLoginPage
                  }, {
                    "props": { from: ctx.to.url }
                  })
              }
        } else {
          if (WxGuestAuthHelper.isAuthenticated()) {
              ctx.resolve({ "component": component })
          } else {
              //console.log("securedRoute: not login, jump to=" + ctx.to.url)
              ctx.resolve({ "component": WxOAuthLoginPage}, {"props": { from: ctx.to.url } })
          }
        }
      }
    }
  }
  
export  function needAdmin(ctx: Router.RouteCallbackCtx) {
    const isAdmin = ctx.to.path.indexOf("/admin/") >= 0
    
    //若还没有CorpParams，则解析url参数，设置它；若已存在则忽略
    const p = WxAuthHelper.getCorpParams()
    if(!p){
      const query:CorpParams = f7.utils.parseUrlQuery(ctx.to.url)
      if(query) WxAuthHelper.setCorpParams(query)
      else {
        console.log("no CorpParams in url and sessionStorage")
      }
    }
    if (isAdmin ? WxAuthHelper.isAuthenticated() : WxGuestAuthHelper.isAuthenticated()) {
      ctx.resolve()
    } else {
      //console.log("not login, needAdmin: jump to: " + ctx.to.path + ",from=" + ctx.from.url)
      ctx.reject()
      ctx.router.navigate({ name: 'login' }, { props: { from: ctx.to.url } });
    }
  }
  