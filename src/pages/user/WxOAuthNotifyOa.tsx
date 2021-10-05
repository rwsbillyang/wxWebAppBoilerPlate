import React, { useState } from 'react';
import { Page, Block, Link, f7 } from 'framework7-react';


import { getFrom, getState, WxGuestAuthHelper } from './wxOAuthHelper';
import { authorizeUrl } from './OALoginPage';
import { GuestOAuthBean } from './authData';
import { AppId } from '@/config';

/**
 * 接到后端通知后，出错则显示错误信息；正确则进行登录(若需admin)获取jwtToken，最后进行跳转
 * 明确指定了是否获取用户信息，则只调用此页面一次；若未指定，即根据参数和owner判断，调用此页面有可能1次，也可能2次
 * 
 * $notifyWebAppUrl?state=$state&step=[1,2]&appId=$appId&code=KO&msg=null_appId_or_code_or_state"
 * $notifyWebAppUrl?state=$state&step=[1,2]&appId=$appId&&code=KO&msg=${res.errMsg}"
 * $oauthNotifyWebAppUrl?state=$state&step=[1,2]&appId=$appId&&code=OK&openId=${res.openId}&needUserInfo=[0,1]
 * 
 * /wxoa/authNotify?state=Qg5z68nYBTttG9a6&step=1&appId=wxe05e4b65760b950c&code=OK&openId=oV79guKWo0mvIUA2pZQE9CGqwLFE&needUserInfo=1
 */
export default (props: any) => {
    const [msg, setMsg] = useState<string>()

    const maybeLoginAndGoBack = (openId?: string) => {
        const from = getFrom()
        console.log("from=" + from)

        if (!from) {
            setMsg("登录成功，请关闭窗口重新打开")
            console.warn("no from")
            //f7.dialog.alert("登录成功，请关闭窗口重新打开")
            return false
        }

        if (from.indexOf('/admin/') < 0) {//无需系统用户，只需得到用户某种id，如newsDetail的访问
            console.log("navigate non-admin page: " + from)
            props.f7router.navigate(from)
            return false
        }

        if(!openId){
            f7.dialog.alert("微信登录出错了，请关闭后重新打开")
            return false
        }
        //必须是系统注册用户
        // login(openId, 
        //     ()=>props.f7router.navigate(from), 
        //     ()=> props.f7router.navigate("/u/register", { props: { from } }),
        //     (msg)=> setMsg("登录失败：" + msg)
        // )
            
        return false
    }

    const pageInit = () => {
        const query = props.f7route.query
        const appId = query["appId"] || AppId
        const step = query["step"]
        if(step === '1'){
        const stateInSession = getState()
        
   

        const state = query["state"]
        if (state !== stateInSession) {
                setMsg("页面可能已过期，可直接关闭")
                console.warn("state=" + state + ", stateInSession=" + stateInSession)
                return false
            }

            //若在step1中，未能成功获取用户openid，则可直接进行step2进行弥补，不要提示出错信息
            const needUserInfo = query["needUserInfo"] || '1'
            if (needUserInfo === '1') {
                //进行第二步认证：目的在于获取用户信息
                window.location.href = authorizeUrl(appId, true)
        } else {
                if (query["code"] !== 'OK') {
                    const err = query["msg"]
                    setMsg(err)
                    console.warn(err)
                    return false
                }
                
 
                const openId = query["openId"]
                if (!openId) {
                    setMsg("缺少参数：openId")
                    console.warn("缺少参数：openId")
                    return false
                }
                const guestAuthBean: GuestOAuthBean = {appId, openId1: openId }
                WxGuestAuthHelper.onAuthenticated(guestAuthBean)
                
                maybeLoginAndGoBack(openId)
                }
        }else if(step === '2'){
            const stateInSession = getState()
            const state = query["state"]

            //保留该校验，目的在于回退时阻止继续进行下去
            if (state !== stateInSession) {
                setMsg("页面可能已过期，可直接关闭")
                console.warn("step2: state=" + state + ", stateInSession=" + stateInSession)
                return false
            }

            //改进用户体验，出错了 不提示，不阻挡
            if (query["code"] !== 'OK') {
                const err = query["msg"]
                console.warn(err)
                                            }
            //const unionId = query["unionId"]
            const openId = query["openId"]
            if (!openId) {
                console.warn("缺少参数：openId")
                                        }else{
                const guestAuthBean: GuestOAuthBean = {appId, openId1: openId, hasUserInfo: true}
                WxGuestAuthHelper.onAuthenticated(guestAuthBean)
                                        } 

                                
            maybeLoginAndGoBack(openId)
                        } else {
            setMsg("parameter error: step="+step)
                        }
        return false
                    }

    return (
        <Page name="authNotify" onPageInit={pageInit}>
            {msg && <Block className="text-align-center">{msg} <br/>
            <Link href="/u/contactKf">联系客服</Link></Block>}
        </Page>
    )   
}


