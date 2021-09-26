
import { WxAuthHelper } from '@/pages/user/wxOAuthHelper';
import { useEffect, useState } from 'react'

import { CODE, DataBox, getDataFromBox } from '@/request/databox'
import { get } from "@/request/myRequest"
import { getItem, saveItem } from '@/request/useCache'
import { KeyPrefix } from '@/config';

//分享接口仅激活的成员数超过200人且已经认证的企业才可在微信上调用。

export interface JsSignature {
    appId: string
    timestamp: number
    nonceStr: string
    signature: string
    objectId: string //share or relay id
}


export const WxJsStatusKey = KeyPrefix + "/WxJsStatus"
export const WxJsNtKey = KeyPrefix + "/WxJsNtKey"

export function isWeixin() {
    return /MicroMessenger/.test(navigator.userAgent);
}
export function isWxWork() {
    var ua = window.navigator.userAgent;
    return /MicroMessenger\/([\d\.]+)/i.test(ua) && /wxwork/i.test(ua)
}



const defaultJsApiList = [
    'onMenuShareTimeline',
    'onMenuShareAppMessage',
    'onMenuShareQQ',
    'onMenuShareWeibo',
    'onMenuShareQZone',

    // 'startRecord',
    // 'stopRecord',
    // 'onVoiceRecordEnd',
    // 'playVoice',
    // 'pauseVoice',
    // 'stopVoice',
    // 'onVoicePlayEnd',
    // 'uploadVoice',
    // 'downloadVoice',
    // 'translateVoice',

    'chooseImage',
    'previewImage',
    'uploadImage',
    'downloadImage',

    'getNetworkType',
    'openLocation',
    'getLocation',
    'hideOptionMenu',
    'showOptionMenu',
    'hideMenuItems',
    'showMenuItems',
    'hideAllNonBaseMenuItem',
    'showAllNonBaseMenuItem',
    'closeWindow',
    'scanQRCode',
    'chooseWXPay',
    'openProductSpecificView',
    'addCard',
    'chooseCard',
    'openCard'
]

/**
 * 错误值越大，离正确结果越远
 */
export const WxJsStatus = {
    NotWeixin: -5,//最终状态
    RequestErr: -4,//最终状态
    ServerResponseErr_KO: -3,//最终状态
    ServerResponseErr_NO_DATA: -2,//最终状态
    WxInitErr: -1,//最终状态
    None: 0,
    SignatureLoading: 1,
    SDKInitializing: 2,
    Ready: 3,
    NetworkTypeLoaded: 4,//最终状态
    NetworkTypeLoadErr: 5 //最终状态
}
export interface WxInitResult {
    status: number,
    networkType?: string
}

/**
 * react hooks版本 需要在设置了corpParams后执行
 * for Official account
 * @param jsapiList 
 */
 export function useWxJsSdk(jsapiList: string[] = defaultJsApiList) {
    const [status, setStatus] = useState(+(getItem(WxJsStatusKey) || '0'))
    const [networkType, setNetworkType] = useState<string|undefined>(getItem(WxJsNtKey))

    useEffect(() => {
        if (!isWeixin() &&  !isWxWork()) {
            setStatus(WxJsStatus.NotWeixin)
            console.log("not in wx")
        } else if(status !== WxJsStatus.NetworkTypeLoaded){ 
            const params = WxAuthHelper.getCorpParams()
            const appId = params?.appId
            if(!appId){
                console.log("no appId="+appId)
            }else{
                get( "/api/wx/oa/jssdk/signature", {appId})
                .then(res => {
                    setStatus(WxJsStatus.SDKInitializing)

                    const box: DataBox<JsSignature> = res.data
                    if (box.code === CODE.OK) {
                        const data = getDataFromBox(box)
                        if (data) {
                            wx.config({
                                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                                appId: data.appId,// 必填，企业微信的corpID
                                timestamp: data.timestamp,// 必填，生成签名的时间戳
                                nonceStr: data.nonceStr,// 必填，生成签名的随机串
                                signature: data.signature, // 必填，签名，见 附录-JS-SDK使用权限签名算法
                                jsApiList: jsapiList// 必填，需要使用的JS接口列表，凡是要调用的接口都需要传进来
                            });

                            wx.ready(() => {
                                setStatus(WxJsStatus.Ready)
                                wx.getNetworkType({
                                    success: function (res: any) {
                                        const networkType = res.networkType
                                        console.log("get networkType="+networkType)
                                        setNetworkType(networkType)
                                        if (networkType) saveItem(WxJsNtKey, networkType)

                                        setStatus(WxJsStatus.NetworkTypeLoaded)
                                        saveItem(WxJsStatusKey, WxJsStatus.NetworkTypeLoaded.toString())
                                    },
                                    fail: function () {
                                        //不关心获取网络类型错误
                                        setStatus(WxJsStatus.NetworkTypeLoadErr)
                                        console.log("fail to get networkType")
                                    }
                                })

                                // if(!DEBUG){
                                //     // 隐藏菜单
                                //     wx.hideMenuItems({
                                //         menuList: [ 'menuItem:refresh', 'menuItem:copyUrl', 'menuItem:openWithSafari'] // 要隐藏的菜单项
                                //     });
                                // }

                            });

                            wx.error((res: any) => {
                                console.error('wx error', res);
                                setStatus(WxJsStatus.WxInitErr)
                                //saveItem(WxJsStatusKey, WxJsStatus.WxInitErr.toString()) //注释掉，目的在于下次可以尝试
                            });

                        } else {
                            const msg = "data is null: " + JSON.stringify(box)
                            console.warn(msg)
                            setStatus(WxJsStatus.ServerResponseErr_NO_DATA)
                            //saveItem(WxJsStatusKey, WxJsStatus.ServerResponseErr_NO_DATA.toString()) //注释掉，目的在于下次可以尝试
                        }
                    } else {
                        const msg = JSON.stringify(box)
                        setStatus(WxJsStatus.ServerResponseErr_KO)
                        //saveItem(WxJsStatusKey, WxJsStatus.ServerResponseErr_NO_DATA.toString()) //注释掉，目的在于下次可以尝试
                        console.warn(msg)
                    }
                })
                .catch(err => {
                    const msg = err.message
                    console.warn(msg)
                    setStatus(WxJsStatus.RequestErr)
                    //saveItem(WxJsStatusKey, WxJsStatus.RequestErr.toString()) //注释掉，目的在于下次可以尝试
                })
            }
        }else{
            //spa webapp, not need update signature for every url
            console.log("already nt="+networkType)
        }
    }, [])
    return { status, networkType }
}



/**
 * react hooks版本 需要在设置了corpParams后执行
 * for wx work
 * @param jsapiList 
 */
export function useWxWorkJsSdk(jsapiList: string[] = defaultJsApiList) {
    const [status, setStatus] = useState(+(getItem(WxJsStatusKey) || '0'))
    const [networkType, setNetworkType] = useState<string|undefined>(getItem(WxJsNtKey))

    useEffect(() => {
        if (!isWeixin() &&  !isWxWork()) {
            setStatus(WxJsStatus.NotWeixin)
            console.log("not in wx")
        } else if(status !== WxJsStatus.NetworkTypeLoaded){ 
            const params = WxAuthHelper.getCorpParams()
            const corpId = params?.corpId
            const agentId = params?.agentId
            if(!corpId || !agentId){
                console.log("no corpId="+corpId+" or agentId="+agentId)
            }else{
                get("/api/wx/work/jssdk/signature", {...params,"type":"agent_config"})
                .then(res => {
                    setStatus(WxJsStatus.SDKInitializing)

                    const box: DataBox<JsSignature> = res.data
                    if (box.code === CODE.OK) {
                        const data = getDataFromBox(box)
                        if (data) {
                            // wx.config({
                            //     beta: true,// 必须这么写，否则wx.invoke调用形式的jsapi会有问题
                            //     debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                            //     appId: data.appId,// 必填，企业微信的corpID
                            //     timestamp: data.timestamp,// 必填，生成签名的时间戳
                            //     nonceStr: data.nonceStr,// 必填，生成签名的随机串
                            //     signature: data.signature, // 必填，签名，见 附录-JS-SDK使用权限签名算法
                            //     jsApiList: jsapiList// 必填，需要使用的JS接口列表，凡是要调用的接口都需要传进来
                            // })
                
                              //https://work.weixin.qq.com/api/doc/90000/90136/90515
                            //config注入的是企业的身份与权限，而agentConfig注入的是应用的身份与权限。尤其是当调用者为第三方服务商时，
                            //通过config无法准确区分出调用者是哪个第三方应用，而在部分场景下，又必须严谨区分出第三方应用的身份，
                            //此时即需要通过agentConfig来注入应用的身份信息。
                            //调用wx.agentConfig之前，必须确保先成功调用wx.config. 
                            //注意：从企业微信3.0.24及以后版本（可通过企业微信UA判断版本号），无须先调用wx.config，可直接wx.agentConfig.
                            //仅部分接口才需要调用agentConfig，需注意每个接口的说明
                            wx.agentConfig({
                                corpid: corpId, // 必填，企业微信的corpid，必须与当前登录的企业一致
                                agentid: agentId, // 必填，企业微信的应用id （e.g. 1000247） ISV模式下不能返回agentId
                                timestamp: data.timestamp, // 必填，生成签名的时间戳
                                nonceStr: data.nonceStr, // 必填，生成签名的随机串
                                signature: data.signature,// 必填，签名，见附录-JS-SDK使用权限签名算法
                                jsApiList: jsapiList, //必填
                                success: function(res: any) {
                                    console.log("wx.agentConfig successfully")
                                },
                                fail: function(res: any) {
                                    if(res.errMsg.indexOf('function not exist') > -1){
                                        alert('版本过低请升级')
                                    }
                                }
                            });

                            wx.ready(() => {
                                setStatus(WxJsStatus.Ready)
                                wx.getNetworkType({
                                    success: function (res: any) {
                                        const networkType = res.networkType
                                        console.log("get networkType="+networkType)
                                        setNetworkType(networkType)
                                        if (networkType) saveItem(WxJsNtKey, networkType)

                                        setStatus(WxJsStatus.NetworkTypeLoaded)
                                        saveItem(WxJsStatusKey, WxJsStatus.NetworkTypeLoaded.toString())
                                    },
                                    fail: function () {
                                        //不关心获取网络类型错误
                                        setStatus(WxJsStatus.NetworkTypeLoadErr)
                                        console.log("fail to get networkType")
                                    }
                                })

                                // if(!DEBUG){
                                //     // 隐藏菜单
                                //     wx.hideMenuItems({
                                //         menuList: [ 'menuItem:refresh', 'menuItem:copyUrl', 'menuItem:openWithSafari'] // 要隐藏的菜单项
                                //     });
                                // }

                            });

                            wx.error((res: any) => {
                                console.error('wx error', res);
                                setStatus(WxJsStatus.WxInitErr)
                                //saveItem(WxJsStatusKey, WxJsStatus.WxInitErr.toString()) //注释掉，目的在于下次可以尝试
                            });

                        } else {
                            const msg = "data is null: " + JSON.stringify(box)
                            console.warn(msg)
                            setStatus(WxJsStatus.ServerResponseErr_NO_DATA)
                            //saveItem(WxJsStatusKey, WxJsStatus.ServerResponseErr_NO_DATA.toString()) //注释掉，目的在于下次可以尝试
                        }
                    } else {
                        const msg = JSON.stringify(box)
                        setStatus(WxJsStatus.ServerResponseErr_KO)
                        //saveItem(WxJsStatusKey, WxJsStatus.ServerResponseErr_NO_DATA.toString()) //注释掉，目的在于下次可以尝试
                        console.warn(msg)
                    }
                })
                .catch(err => {
                    const msg = err.message
                    console.warn(msg)
                    setStatus(WxJsStatus.RequestErr)
                    //saveItem(WxJsStatusKey, WxJsStatus.RequestErr.toString()) //注释掉，目的在于下次可以尝试
                })
            }
        }else{
            //spa webapp, not need update signature for every url
            console.log("already nt="+networkType)
        }
    }, [])
    return { status, networkType }
}





/**
 *  不推荐， 推荐使用react hooks版本
 * 纯粹用于初始化wx js sdk, 调用wx.config，ready后获取network type
 * 需要用到的值是status和network type，保存在sessionStorage中,
 * 同时发送一个自定义事件CustomEvent，用于initWxJsSdk中异步调用完成后的结果通知
 * 需要networkType的地方，调用getWxInitResult得到一个promise获取初始化结果
 * 
 * 对单页应用SPA来说，只在全局首页中调用一次即可
 * 对普通页面来说，需要用到js-sdk的地方调用
 * 
 */
 export function initWxJsSdk(
    jsapiList: string[] = defaultJsApiList) {

    sendWxInitResultEvent(WxJsStatus.None)

    if (!isWeixin()) {
        sendWxInitResultEvent(WxJsStatus.NotWeixin)
        console.log("not in wx")
        return false
    }

    get("/api/wx/oa/jssdk/signature", WxAuthHelper.getCorpParams())
        .then(res => {
            sendWxInitResultEvent(WxJsStatus.SDKInitializing)

            const box: DataBox<JsSignature> = res.data
            if (box.code === CODE.OK) {
                const data = getDataFromBox(box)
                if (data) {
                    wx.config({
                        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: data.appId,// 必填，企业微信的corpID
                        timestamp: data.timestamp,// 必填，生成签名的时间戳
                        nonceStr: data.nonceStr,// 必填，生成签名的随机串
                        signature: data.signature, // 必填，签名，见 附录-JS-SDK使用权限签名算法
                        jsApiList: jsapiList// 必填，需要使用的JS接口列表，凡是要调用的接口都需要传进来
                    });

                    wx.ready(() => {
                        sendWxInitResultEvent(WxJsStatus.Ready)
                        wx.getNetworkType({
                            success: function (res: any) {
                                sendWxInitResultEvent(WxJsStatus.NetworkTypeLoaded, res.networkType)
                            },
                            fail: function () {
                                //不关心获取网络类型错误
                                sendWxInitResultEvent(WxJsStatus.NetworkTypeLoadErr)
                            }
                        })

                        // if(!DEBUG){
                        //     // 隐藏菜单
                        //     wx.hideMenuItems({
                        //         menuList: [ 'menuItem:refresh', 'menuItem:copyUrl', 'menuItem:openWithSafari'] // 要隐藏的菜单项
                        //     });
                        // }

                    });

                    wx.error((res: any) => {
                        console.error('wx error', res);
                        sendWxInitResultEvent(WxJsStatus.WxInitErr)
                    });

                } else {
                    const msg = "data is null: " + JSON.stringify(box)
                    console.warn(msg)
                    sendWxInitResultEvent(WxJsStatus.ServerResponseErr_NO_DATA)
                }
            } else {
                const msg = JSON.stringify(box)
                sendWxInitResultEvent(WxJsStatus.ServerResponseErr_KO)
                console.warn(msg)
            }
        })
        .catch(err => {
            const msg = err.message
            console.warn(msg)
            sendWxInitResultEvent(WxJsStatus.RequestErr)
        })

    return false
}
/**
 * 与initWxJsSdk配套使用， 不推荐
 */
export const getWxInitResult = () => {
    return new Promise((resolve: (result: WxInitResult) => void, reject) => {
        const status = +(getItem(WxJsStatusKey) || '0')
        if (status > WxJsStatus.Ready) {
            const networkType = getItem(WxJsNtKey)
            resolve({ status, networkType })
        } else if (status < WxJsStatus.None) {
            reject(status.toString())
        } else {
            //等待结果, 添加等待事件发送过来的处理函数
            const listener = (e: CustomEvent) => {
                const result = e.detail
                console.log("waiting: get result=" + JSON.stringify(result))
                if (result.status > WxJsStatus.Ready || result.status < WxJsStatus.None) {
                    document.removeEventListener<any>("WxInitResult", listener)
                    resolve(result)
                } else {
                    console.log("keep waiting: status=" + JSON.stringify(result))
                }
            }
            //添加事件监听
            document.addEventListener<any>("WxInitResult", listener)
            //会不会在addEventListener时发送事件？导致没收到，再检查一次
            checkResult(resolve, reject)
        }
    });
}


/**
 * 用于initWxJsSdk将结果保存到sessionStorage中，并发出CustomEvent事件
 */
 const sendWxInitResultEvent = (status: number, networkType?: string) => {
    saveItem(WxJsStatusKey, status.toString())
    if (networkType) saveItem(WxJsNtKey, networkType)

    // 创建事件 https://developer.mozilla.org/zh-CN/docs/Web/API/CustomEvent
    //bubbles 一个布尔值,表明该事件是否会冒泡.  cancelable  一个布尔值,表明该事件是否可以被取消. detail 当事件初始化时传递的数据.
    var event = new CustomEvent<WxInitResult>("WxInitResult", { "detail": { status, networkType } })
    document.dispatchEvent(event)
}

const checkResult = (resolve: (result: WxInitResult) => void, reject: (reason: any) => void) => {
    const status = +(getItem(WxJsStatusKey) || '0')
    if (status > WxJsStatus.Ready) {
        const networkType = getItem(WxJsNtKey)
        resolve({ status, networkType })
    } else if (status < WxJsStatus.None) {
        reject(status.toString())
    }
}




export const showUserDetail = (id: string, messageType: string) => {
    let type:number = -1
    if("received" === messageType) type = 2
    else if(messageType === "sent") type = 1
    if(type > 0){
        wx.invoke('openUserProfile', {
            "type": type, //1表示该userid是企业成员，2表示该userid是外部联系人
            "userid": id //可以是企业成员，也可以是外部联系人
        }, function (res: any) {
            if (res.err_msg != "openUserProfile:ok") {
                //错误处理
                console.warn(res.err_msg)
            }
        });
    }else{
        console.warn("not support type="+type)
    }
    
}