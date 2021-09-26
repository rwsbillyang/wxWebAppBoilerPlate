import React, { useEffect, useState } from 'react';
import { Block, f7, Page } from 'framework7-react';

import { randomAlphabetNumber } from '@/utils/random';
import { getWithouAuth, postWithouAuth } from '@/request/myRequest';
import { saveFrom, saveState, WxAuthHelper, WxGuestAuthHelper } from './wxOAuthHelper';
import { AuthBean, CorpParams, LoginParam, OAuthInfo } from './authData';
import { AppId } from '@/config';
import { CODE, DataBox, getDataFromBox } from '@/request/databox';

const Scope = {
    base: "snsapi_base",
    userInfo: "snsapi_userinfo"
}

 //与后端保持一致
const NotifyPath = {
    base:  "/api/wx/oa/oauth/notify1",
    userInfo:  "/api/wx/oa/oauth/notify2"
}


//snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），snsapi_userinfo 
//（弹出授权页面，可通过openid拿到昵称、性别、所在地。并且， 即使在未关注的情况下，只要用户授权，也能获取其信息 ）
export const authorizeUrl = (appId: string, needUserInfo: boolean) => {
    const state = randomAlphabetNumber(12)
    saveState(state)

    const notifyPath = needUserInfo ? NotifyPath.userInfo : NotifyPath.base
    const scope = needUserInfo ? Scope.userInfo: Scope.base 

    const Host =  window.location.protocol + "//" + window.location.host
    const redirectUri = encodeURI(`${Host}${notifyPath}/${appId}`)

    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
}


const LoginPage: React.FC<LoginParam> = (props: any) => {
    const [status, setStatus] = useState<string>()
    
    const query: CorpParams =  f7.utils.parseUrlQuery(props.from);
    const appId = query.appId || AppId

    const {from, needUserInfo, owner, silentLogin} = props

    const directlyRedirect = (needUserInfo: boolean) => {
        if (from) saveFrom(from)
        window.location.href = authorizeUrl(appId, needUserInfo)
    }

    /**
     * 只有newsDetail中，若已经有openId，再去获取userInfo时，直接进入step2获取用户信息，无需经过step1
     */
    const getOauthInfo = (openId?: string) => {
        console.log("LoginPage getOauthInfo...")

        f7.dialog.preloader('登录中...')

    
        getWithouAuth( '/api/wx/oa/oauth/info', {...query, owner: props.owner, openId: props.openId})
       //前端负责state，拼接跳转url， state校验，然后直接进行跳转，不再向后端请求
            .then(function (res) {
                f7.dialog.close()
                const oauthInfo: OAuthInfo = res.data
                if(openId && !oauthInfo.needUseInfo){ //若已有openId，且无需获取userInfo，直接打开页面
                    //这时需要设置hasUserInfo，否则又回到打开newsDetail的链接，一直无限循环下去
                    WxGuestAuthHelper.onAuthenticated({ appId: appId, openId: openId, hasUserInfo: true})
                    window.location.href = from //props.f7router.navigate(from)
                }else{
                    saveState(oauthInfo.state)
                    if (from) saveFrom(from)
                    window.location.href = oauthInfo.authorizeUrl //有可能获取用户信息，有可能不获取
                }
                
            })
            .catch(function (err) {
                f7.dialog.close()
                const msg = err.status + ": " + err.message
                console.log(msg)
                setStatus(msg)
                f7.dialog.alert(msg)
            })
    }

     //在RoutableTabs中，故onPageInit不被trigger，故使用useEffect
    useEffect(()=> {
        if(needUserInfo === undefined){ //没有明确指定是否获取userInfo，通常用于newsDetail页面
            if(!owner){
                console.warn("owner is undefined, are you sure?")
                directlyRedirect(true) //没有owner情况，都认为需要获取userinfo
            }else{
                const guestOpenId = WxGuestAuthHelper.getAuthBean()?.openId
                if(guestOpenId){//已经经过第一步认证，即有openId，但无头像和昵称，直接进入根据后端判定是否进入第二步
                    getOauthInfo(guestOpenId) 
                }else{//全新用户，还要从step1开始进行认证，即先获取openId，后端通知前端是否进行第二步获取用户信息
                    getOauthInfo() //没有明确要求的，用于传递owner至后端，以便notify1通知时根据owner和openId，确定是否需要获取用户信息 
                }
            }
        }else{
            if(silentLogin){//静默登录
                //const f7router = f7.views.main.router
                const openId = WxAuthHelper.getAuthBean()?.openId
                if(!openId){
                    directlyRedirect(needUserInfo) //无openId
                }else{
                    console.log("silent login...")
                    postWithouAuth(`/api/u/login`, { name: openId,  type: "wechat" })
                    .then(function (res) {
                        f7.dialog.close()
                        const box: DataBox<AuthBean> = res.data
                        if (box.code == CODE.OK) {
                            const authBean = getDataFromBox(box)
                            if (authBean) {
                                WxAuthHelper.onAuthenticated(authBean)
                            } else {
                                console.log(box.msg)
                            }
                        } else if (box.code == CODE.NewUser) {
                            window.location.href = "/u/register?from="+from
                        } else {
                            console.log(box.msg)
                            f7.dialog.alert("出错了：试试关闭窗口，重新打开"+box.msg)
                        }
                    })
                    .catch(function (err) {
                        f7.dialog.close()
                        const msg_ = err.status + ": " + err.message
                        console.log(msg_)
                        f7.dialog.alert("出错了："+msg_)
                    })
            
                }
            }else{
                directlyRedirect(needUserInfo) //有明确要求是否获取
            }    
        }
    }, [])

    return (
        <Page name="oalogin" >
           {status && <Block className="text-align-center">{status}</Block>} 
        </Page>
    )
}

export default LoginPage