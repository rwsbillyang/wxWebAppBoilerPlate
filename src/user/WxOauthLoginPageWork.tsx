import React, { useEffect } from 'react';
import { Page, f7, Block } from 'framework7-react';
import { getWithouAuth } from '@/request/myRequest';
import { CorpParams, LoginParam, OAuthInfo } from './AuthData';
import { DEBUG } from '@/config';
import { saveValue } from './WxOauthHelper';
import { WebAppHelper } from './WebAppHelper';




/**
 * 显示 登录中...
 * 获取OauthInfo 然后重定向到用户授权页面，后端接到授权通知后再通知到前端认证结果，
 * 前端再获取jwt token，再重定向到原请求页面 onPageInit={pageInit}
 * 
 * 下一步将执行到wxOAuthNotifyxx.tsx
 */
const WxOauthLoginPageWork: React.FC<LoginParam> = (props: LoginParam) => {

    //对于RoutableTab，无pageInit等page事件
    const pageInit = () => {
        const from = props.from
        console.log("oauth login from " + from)
        f7.dialog.preloader('登录中...')

        //请求地址："/api/wx/work/oauth/info?scope=2" scope可选默认为2, scope： 0， 1， 2 分别对应：snsapi_base, snsapi_userinfo, snsapi_privateinfo
        // 如果scope==2，非企业成员，直接提示出错
        //- 内建单应用：`/api/wx/work/oauth/info`
        //- 内建多应用：`/api/wx/work/oauth/info?corpId=${corpId}&agentId=${agentId}`
        //- 第三方单应用：`/api/wx/work/oauth/info`
        //- 第三方多应用：`/api/wx/work/oauth/info?suiteId=${suiteId}`
        //为了提高前端兼容性，支持多应用、内建应用、第三方应用，将从from中遍历获取各个参数，传递给后端
        //故：故配置的入口页url中需要有正确的参数
        //const query: any =  f7.utils.parseUrlQuery(props.from);
        const corpsParam = WebAppHelper.getCorpParams()
        const param: CorpParams = {...corpsParam, appId: corpsParam?.appId || props.appId}


        getWithouAuth('/api/wx/work/oauth/info?scope=1', param)
            .then(function (res) {
                f7.dialog.close()
                const oauthInfo: OAuthInfo = res.data

                saveValue("state" ,oauthInfo.state)

                //const from = f7.views.main.router.currentRoute.query["from"]
                const authStorageType = props.authStorageType
                if(authStorageType !== undefined) saveValue("authStorageType", authStorageType.toString())

                if (from) saveValue("from",from)
                if(DEBUG) console.log("reidreact authorizeUrl="+oauthInfo.authorizeUrl)
                window.location.href = oauthInfo.authorizeUrl
            })
            .catch(function (err) {
                f7.dialog.close()
                f7.dialog.alert(err.status + ": " + err.message)

                console.log(err.xhr + ", " + err.status + ": " + err.message)
            })
    }

    useEffect(() =>{ 
        pageInit() //对于RoutableTab，无pageInit等page事件
    }, [])

    return (
        <Page name="login" >
            <Block>请稍候...</Block>
        </Page>
    )
}

export default WxOauthLoginPageWork
