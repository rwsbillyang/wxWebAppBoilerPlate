import React, { useState } from 'react';
import { Page, Block, f7 } from 'framework7-react';
import { postWithouAuth } from '@/request/myRequest';
import { CODE, DataBox, getDataFromBox } from '@/request/databox';
import { getValue, WxAuthHelper, WxGuestAuthHelper } from './WxOauthHelper';
import { AuthBean, GuestOAuthBean } from './AuthData';
import { DEBUG } from '@/config';
import { StorageType } from '@/request/useCache';

/**
 * OAuthLogin成功后的通知
 * 
 * 接到后端通知后，出错则显示错误信息；正确则进行登录，获取jwtToken，最后进行跳转
 * "$notifyWebAppUrl?state=$state&code=KO&msg=nullCodeOrState"
 * "$notifyWebAppUrl?state=$state&code=KO&msg=NotFoundAgentIdInCache"
 * "$notifyWebAppUrl?state=$state&code=NotAllow&msg=Forbidden&corpId=CORPID&agentId=${pair.second}"
 * "$notifyWebAppUrl?state=$state&code=KO&msg=${res.errCode}:${res.errMsg}
 * $oauthNotifyWebAppUrl?state=$state&code=OK&userId={userId?}&corpId=CORPID&agentId=AGENTID&externalUserId=${externalUserId?}&&openId=${openId?}
 * 
 * 坑：若提示“页面可能已过期，state校验失败”，有可能是https和http不一致的问题，假如设置的访问首页是https，但通知时却是http，
 * 就会产生这个问题，因为保存的storage不在同一域名(包括scheme)下，通知此页的路径scheme又是根据指定给腾讯的通知回调url决定，
 * 尤其是部署在nginx后的upstream server得到的scheme，有可能是来自nginx的请求，也就是http，而实际主页地址却是https，就产生了不一致
 * 解决方式是确保指定给腾讯的回调url是https的
 */
const WxOauthNotifyWork: React.FC = (props: any) => {
    const [status, setStatus] = useState("请稍候...")
    if (DEBUG) console.log("WxWorkOAuthNotify...")

    const pageInit = () => {
        if (DEBUG) console.log("WxWorkOAuthNotify pageInit... url=" + props.f7route.url)
        //f7.dialog.preloader('登录中...')
        const query = props.f7route.query
        const stateInSession = getValue("state")

        // console.log(query)

        const state = query["state"]
        if (state !== stateInSession) {
            setStatus("页面可能已过期，state校验失败")
        } else {
            const code = query["code"]
            //const isIsv = query["isIsv"]
            if (code !== 'OK') {
                setStatus(query["msg"] + ": 请联系企业微信管理员")
            } else {
                const corpId = query["corpId"]
                if (!corpId) {
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
                    corpId, agentId, suiteId, userId, externalUserId, openId2: openId, deviceId
                }

                //默认使用BothStorage
                const authStorageType = +(getValue("authStorageType") || StorageType.BothStorage.toString())
                WxGuestAuthHelper.onAuthenticated(initialAuthBean, authStorageType)

                const from = getValue("from")
                if (!from) {
                    console.log("no from")
                    setStatus("登录成功")
                } else {
                    if (from.indexOf('/admin/') >= 0) {//必须是系统注册用户
                        //还需进一步验证权限
                        if (userId) {
                            if (!corpId) {
                                setStatus("缺少参数：corpId")
                            } else {
                                console.log("login WxWorkOAuthNotify...")

                                let url = `/api/wx/work/account/login`
                                //是否扫码登录，是的话传递给后台，单独处理 WxScanQrcodeLoginConfirmPage中设置scanQrcodeId
                                const scanQrcodeId = getValue("scanQrcodeId")
                                if(scanQrcodeId) url = url + "?scanQrcodeId="+scanQrcodeId
                                
                                postWithouAuth(url, initialAuthBean)
                                    .then(function (res) {
                                        //f7.dialog.close()
                                        const box: DataBox<AuthBean> = res.data
                                        const authBean = getDataFromBox(box)
                                        if (box.code === CODE.OK) {
                                            if (authBean) {
                                                WxAuthHelper.onAuthenticated(authBean, authStorageType)

                                                f7.views.main.router.navigate(from)  //window.location.href = from 
                                            } else {
                                                setStatus("异常：未获取到登录信息")
                                            }
                                        } else if (box.code == CODE.NewUser) {
                                            window.location.href = "/u/register?from=" + from
                                            //使用router.navigate容易导致有的手机中注册页面中checkbox和a标签无法点击,原因不明
                                            //f7.views.main.router.navigate("/u/register",{ props: {from: from }})
                                        } else if (box.code === "SelfAuth") {
                                            //成员自己授权使用，引导用户授权应用
                                            setStatus("请自行安装应用")
                                            //f7.views.main.router.navigate(from)
                                            //props.f7router.navigate(from)  //window.location.href = from 
                                        } else {
                                            setStatus("登录失败，请联系管理员：" + box.msg)
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
                    } else {//无需系统用户，只需得到用户某种id，如newsDetail的访问            
                        //window.location.href = from 
                        f7.views.main.router.navigate(from)
                        //props.f7router.navigate(from)
                    }
                }
            }
        }
    }
    return (
        <Page name="workAuthNotify" onPageAfterIn={pageInit}>
            {/* <Block>{"currentRoute=" + f7.views.main.router.currentRoute.path }</Block> */}
            <Block>{status}</Block>
        </Page>
    )
}

export default WxOauthNotifyWork