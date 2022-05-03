import React, { useEffect, useState } from 'react';
import { Block, Button, f7, Page } from 'framework7-react';

import useWebSocket, { ReadyState } from 'react-use-websocket';
import QRCode from 'qrcode.react';

import { saveValue, WxAuthHelper, WxGuestAuthHelper } from './WxOauthHelper';


import { getWithouAuth } from '@/request/myRequest';
import { fetchDiscachely, StorageType } from '@/request/useCache';
import { CODE, DataBox, getDataFromBox } from '@/request/databox';
import { AuthBean, CorpParams, LoginParam } from './AuthData';
import { pageCenter, pageCenter3 } from '@/components/style';
import { WebAppHelper } from './WebAppHelper';
import { isWeixinBrowser, isWxWorkBrowser } from '@/utils/wxJsSdkHelper';




/**
 * 收到确认显示二维码后，得到一个特殊的id，编码到二维码中，此id将在手机扫码登录时获取，
 * 并登录时提交给后台，后台根据此找到对应的socket的session，从而发消息给PC，通知登录成功
 * PC上显示二维码：wssocket建立连接后，将确认页面编码成二维码，
 * 
 * https://github.com/robtaussig/react-use-websocket
 * npm install react-use-websocket
 * 
 * https://wx.niukid.com/#!/wx/scanLogin/show?corpId=ww5f4c472a66331eeb&agentId=1000006&from=/wx/super/admin/home
 * https://wx.niukid.com/#!/wx/scanLogin/show?appId=xxxx&from=/wx/super/admin/home
 * https://wx.niukid.com/#!/wx/scanLogin/show?corpId=ww5f4c472a66331eeb&agentId=1000006&from=/afterSale/ww5f4c472a66331eeb/admin/customer/list
 * 
 * @param props 
 * @returns 
 */
export const PcShowQrcodePage: React.FC<LoginParam> = (props: any) => {
    const ELAPSE = 180

    const [err, setErr] = useState<string | undefined>()
    const [url, setUrl] = useState<string | undefined>()
    const [elapse, setElapse] = useState(ELAPSE)


    const query = props.f7route.query
    const from = query.from || props.from

    const corpParams: CorpParams = WebAppHelper.getCorpParams() || { corpId: query.corpId, agentId: query.agentId, suiteId: query.suiteId, appId: query.appId }

    const host = window.location.host
    // This can also be an async getter function. See notes below on Async Urls.
    const socketUrl = 'wss://' + host + '/api/u/scanQrcodeLogin';
    const {
        sendMessage,
        lastMessage,
        readyState,
    } = useWebSocket(socketUrl);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];


    useEffect(() => {
        const timer = setInterval(() => {
            setElapse(elapse - 1);
        }, 1000);
        return () => clearInterval(timer);  // clearing interval
    });

    useEffect(() => {
        if ((!corpParams.corpId || !corpParams.agentId) && !corpParams.suiteId && !corpParams.appId) {
            setErr("no corpID=xxx&agentId=xxx or appId=xxx or suiteId=xxxx")
        } else if (readyState === ReadyState.OPEN) {
            sendMessage("getId") //发送消息
        }
    }, [readyState]);

    useEffect(() => {
        if (lastMessage !== null) {
            const text: string = lastMessage.data

            console.log("from remote get text=" + text)

            if (text.indexOf("id=") >= 0) { //得到回复
                const id = text.substring(3) //得到socket Session id

                const params = { ...corpParams, id , needUserInfo: props.needUserInfo}
                const url = window.location.protocol + "//" + host + "/#!/wx/scanLogin/confirm?" + f7.utils.serializeObject(params)

                console.log("qrcode url: " + url)

                setUrl(url)
                setTimeout(() => {
                    setUrl(undefined)
                    sendMessage("bye, id=" + id)
                }, ELAPSE * 1000)//3分钟后超时发送关闭连接消息，关闭二维码
            } else if (text.indexOf('cancel') >= 0) {
                console.log("cancel login")
                setErr("手机端取消了扫码登录")
                setUrl(undefined)
            } else if (text.indexOf("json=") >= 0) {//登录成功返回的认证字符串
                const json = text.substring(5)
                const box: DataBox<AuthBean> = JSON.parse(json)
                if (box.code == CODE.OK) {
                    const authBean = getDataFromBox(box)
                    if (authBean) {
                        //默认使用BothStorage
                        const authStorageType = props.authStorageType || StorageType.BothStorage
                        //console.log("PcShowQrcodePage: authStorageType="+authStorageType)
                        WxAuthHelper.onAuthenticated(authBean, authStorageType)
                        
                        //跳转到目的地
                        if(from) window.location.href = from // props.f7router.navigate(from) //window.location.href = 
                        else f7.toast.show({text:"登录成功！"})
                    } else {
                        console.log(box.msg)
                    }
                }
            }
        }
    }, [lastMessage]);


    return (
        <Page name="scanQrcodelogin" >
            <Block style={pageCenter}>
                <p>
                    {
                        url && <QRCode
                            id="qrCode"
                            value={url}
                            size={300} // 二维码的大小
                            fgColor="#000000" // 二维码的颜色
                        />
                    }</p>
                <p className='text-align-center'>{err? err : (elapse > 0 ? elapse + "秒后失效" : "已失效！")}</p>
                <p className='text-align-center'>{url ? (<><span style={{ fontWeight: "bold" }}>{corpParams.corpId ? "企业微信" : "微信"}</span>  <span>扫一扫登录</span> </>) : connectionStatus}</p>
            </Block>

        </Page>
    )
}

/**
 * 手机扫码登录，适合微信和企业微信扫码
 * 手机微信或企业微信打开confirm页面后，确认登录之后跳转到admin页面，导致登录授权跳转
 * 
 * /wx/scanLogin/confirm
 * @param props 
 * @returns 
 */
export const WxScanQrcodeLoginConfirmPage: React.FC = (props: any) => {
    const [err, setErr] = useState<string | undefined>()
    const query = props.f7route.query
    const id = query.id

    const p = WebAppHelper.getCorpParams()
    if (!p) {
        const params: CorpParams = { corpId: query.corpId, agentId: query.agentId, suiteId: query.suiteId, appId: query.appId }

        if ((!query.corpId || !query.agentId) && !query.suiteId && !query.appId) {
            console.log("no corpID=xxx&agentId=xxx or appId=xxx or suiteId=xxxx")
            setErr("no corpID=xxx&agentId=xxx or appId=xxx or suiteId=xxxx")
        } else {
            WebAppHelper.setCorpParams(params) //为WxScanQrcodeLoginDonePage做准备
        }

        if (isWxWorkBrowser()) {
            if (!query.corpId && !query.suiteId) {
                setErr("该应用为企业应用，请用企业微信扫一扫")
            }
        } else if (isWeixinBrowser()) {
            if (!query.appId) {
                setErr("该应用为微信应用，请用微信扫一扫")
            }
        }

    }

    return (
        <Page name="confirmScanQrcodelogin" >
            <Block style={pageCenter3}>
                <p className="text-align-center">{err ? err : "您正在进行扫码登录"}</p>
                <p>
                    <Button large outline color="gray" onClick={() => {
                        fetchDiscachely(() => getWithouAuth("/api/u/cancelQrcodeLogin?id=" + id))
                    }}>取消登录</Button>
                </p>
                <p>
                    <Button large outline onClick={() => {
                        if(err){
                            f7.toast.show({text:err})
                        }else{
                            //清除登录缓存，避免因缓存而不进行远程登录
                            WxAuthHelper.onSignout()
                            WxGuestAuthHelper.onSignout()

                            saveValue("scanQrcodeId", id) //设置扫码登录标志，导致微信登录时采用不同的登录参数
                            f7.views.main.router.navigate({ name: "scanQrcodeLoginDone" }) //TODO: 是否需要needUserInfo等参数
                        }
                        
                    }}>确认登录</Button>
                </p>
            </Block>
        </Page>
    )
}

/**
 * 登录成功后返回
 * @param props 
 * @returns 
 */
export const WxScanQrcodeLoginDonePage: React.FC = (props: any) => {
    return (
        <Page name="scanQrcodeLoginDone" >
            <Block style={pageCenter3}>
                <p className="text-align-center">扫码登录成功</p>
                <p>
                <Button large outline onClick={() => wx.closeWindow()}>关闭</Button>
                </p>
            </Block>
        </Page>
    )
}

