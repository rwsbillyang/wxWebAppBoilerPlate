
/**
 * 后端在通知前端oauth认证时采用的前端路径必须与此一致，
 * 注意： 前端若是SPA，通知路径可能需要添加browserHistorySeparator
 */
 export const BrowserHistorySeparator = "#!"

 export const TextOK = "确定"
 export const TextCancel = "取消"
 export const TextBack = "返回"

 export const hasNavBar = () => false 


 export const enableAgentConfig = false //企业微信是否注入agentConfig

 //export const isWxWorkApp = true //根据进入的url参数自动判断，用于同一套前端webapp同时支持公众号和企业微信

 export const DEBUG = false//一些log调试开关
 
 export const AppName = "WxWebapp Boilerplate"
 export const Version = "1.0"
 export const AppKeyPrefix = "/wxWebapp"  

 //wx0f92cbee09e231f9 : youke
 export const AppId = "wx0f92cbee09e231f9"

 export const Host =  window.location.protocol + "//" + window.location.host // window.location.protocol: https:
