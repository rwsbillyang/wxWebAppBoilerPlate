import React, { useState } from 'react';
import { Page, Block, f7 } from 'framework7-react';
import { getWithouAuth } from '@/request/myRequest';
import { CODE, DataBox, getDataFromBox } from '@/request/databox';
import { getFrom, getState, WxAuthHelper, WxGuestAuthHelper } from './wxOAuthHelper';
import { AuthBean, GuestOAuthBean } from './authData';

/**
 * OAuthLogin成功后的通知
 * 
 * 接到后端通知后，出错则显示错误信息；正确则进行登录，获取jwtToken，最后进行跳转
 * "$notifyWebAppUrl?state=$state&code=KO&msg=nullCodeOrState"
 * "$notifyWebAppUrl?state=$state&code=KO&msg=NotFoundAgentIdInCache"
 * "$notifyWebAppUrl?state=$state&code=NotAllow&msg=Forbidden&corpId=CORPID&agentId=${pair.second}"
 * "$notifyWebAppUrl?state=$state&code=KO&msg=${res.errCode}:${res.errMsg}
 * $oauthNotifyWebAppUrl?state=$state&code=OK&userId={userId?}&corpId=CORPID&agentId=AGENTID&externalUserId=${externalUserId?}&&openId=${openId?}
 */
const WxOaOAuthNotify : React.FC = (props: any) => {
    const [status, setStatus] = useState("请稍候...")

    const pageInit = () => {
        console.log("WxWorkOAuthNotify pageInit... url=" + props.f7route.url)
        //f7.dialog.preloader('登录中...')
        const query = props.f7route.query
        const stateInSession = getState()
        
        //console.log(query)

        const state = query["state"]
        if (state !== stateInSession) {
            setStatus("页面可能已过期，state校验失败")
        } else {
            const code = query["code"]
            //const isIsv = query["isIsv"]
            if(code !== 'OK'){
                setStatus(query["msg"]+": 请联系企业微信管理员")
            }else{
                const corpId = query["corpId"]
                if(!corpId ){
                    setStatus(query["msg"] || "无corpId")    
                }
                
                const userId = query["userId"]
                const externalUserId = query["externalUserId"]
                const openId = query["openId"]
                const agentId = query["agentId"]
                const deviceId = query["deviceId"]
                const suiteId = query["suiteId"]
                
                //此时的agentId可能为空
                const initialAuthBean: GuestOAuthBean = {
                    corpId, agentId, suiteId, userId, externalUserId, openId
                }
                WxGuestAuthHelper.onAuthenticated(initialAuthBean)

                const from = getFrom()
                if(!from){
                    setStatus("登录成功")
                }else{
                    if(from.indexOf('/admin/') >= 0){//必须是系统注册用户
                        //还需进一步验证权限
                        if (userId) {
                            if(!corpId){
                                setStatus("缺少参数：corpId")
                            }else{
                                getWithouAuth(`/api/wx/work/account/login`, {userId, corpId, agentId, openId, externalUserId, deviceId})
                                    .then(function (res) {
                                        //f7.dialog.close()
                                        const box: DataBox<AuthBean> = res.data
                                        const authBean = getDataFromBox(box)
                                        if (box.code === CODE.OK) 
                                        {
                                            if(authBean){
                                                WxAuthHelper.onAuthenticated(authBean)
                                                //configWxWork(authBean.corpId, authBean.agentId)

                                                props.f7router.navigate(from)  //window.location.href = from 
                                            }else{
                                                setStatus("异常：未获取到登录信息")
                                            }
                                        }else if(box.code === "SelfAuth"){
                                            //成员自己授权使用，引导用户授权应用
                                            setStatus("请自行安装应用")
                                            //f7.views.main.router.navigate(from)
                                            //props.f7router.navigate(from)  //window.location.href = from 
                                        }else{
                                            setStatus("登录失败，请联系管理员："+box.msg)
                                        } 
                                    }).catch(function (err) {
                                        setStatus(err.status + ": " + err.message)
                                        console.log(err.status + ": " + err.message)
                                    })
                                
                            }
                        } else {
                            //for external customer, or external user
                            // f7.dialog.alert("Forbidden")
                            setStatus("no userId, Forbidden")
                        }
                    }else{//无需系统用户，只需得到用户某种id，如newsDetail的访问            
                        //window.location.href = from 
                        f7.views.main.router.navigate(from)
                        //props.f7router.navigate(from)
                    }
                }
            }
        }
    }
    return (
        <Page name="authNotify" onPageAfterIn={pageInit}>
            {/* <Block>{"currentRoute=" + f7.views.main.router.currentRoute.path }</Block> */}
            <Block>{ status }</Block>
        </Page>
    )   
}

export default WxOaOAuthNotify