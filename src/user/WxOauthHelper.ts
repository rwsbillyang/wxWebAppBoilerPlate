import { AppKeyPrefix } from "@/config"
import { AuthBean,  GuestOAuthBean } from "./AuthData"
import { WebAppHelper } from "./WebAppHelper"


/**
 * 适用于公众号和企业微信 oauth身份认证
 */
export const WxGuestAuthHelper = {
    getKey(): string {
        return WxAuthHelper.getKey() + "/guest"
    },
    getAuthBean(): GuestOAuthBean | undefined {
        const key = WxGuestAuthHelper.getKey()
        let value = sessionStorage.getItem(key)
        if (!value) {
            value = localStorage.getItem(key)
            if (!!value) {
                sessionStorage.setItem(key, value)
            } else {
                console.log("no value in storage for key=" + key)
                return undefined
            }
        }
        return JSON.parse(value)
    },
    onAuthenticated(authBean: GuestOAuthBean) {
        const key = WxGuestAuthHelper.getKey()
        const str = JSON.stringify(authBean)
        sessionStorage.setItem(key, str)
        localStorage.setItem(key, str)
    },
    /**
     * 判断是否登录
     */
    isAuthenticated(): boolean {
        const authBean = WxGuestAuthHelper.getAuthBean()
        if (authBean)
            return true
        else
            return false
    }
}

export const WxAuthHelper = {
    getKey(): string {
        const p = WebAppHelper.getCorpParams()
        const corpId_ = p?.corpId || p?.appId || p?.suiteId || 'nocorp'
        const agentId_ = p?.agentId || 0
        const key = `${AppKeyPrefix}/${corpId_}/${agentId_}/auth`
        return key
    },
    /**
     * 判断是否登录
     */
    isAuthenticated(): boolean {
        const authBean = WxAuthHelper.getAuthBean()
        if (authBean && authBean.token)
            return true
        else
            return false
    },
    hasRole(role: string){
        const authBean = WxAuthHelper.getAuthBean()
        if (authBean && authBean.uId && authBean.token && authBean.role) {
            for (let i = 0; i < authBean.role.length; i++) {
                if (authBean.role[i] === role)
                    return true
            }
            return false
        } else {
            return false
        }
    },
    /**
     * 是否是系统管理员
     */
    isAdmin() {
        return WxAuthHelper.hasRole("admin")
    },
    /**
     *  登录成功后的动作，记录下登录信息
     */
    onAuthenticated(authBean: AuthBean) {
        const key = WxAuthHelper.getKey()
        const str = JSON.stringify(authBean)
        sessionStorage.setItem(key, str)
        localStorage.setItem(key, str)
    },
    /**
     * 退出登录成功后的动作
     */
    onSignout(cb?: () => void) {
        const key = WxAuthHelper.getKey()
        sessionStorage.removeItem(key)
        localStorage.removeItem(key)
        if (cb) {
            cb()
        }
    },


    /**
     * 
     * @param id 用户id字符串
     * @param token jwt token
     * @param level 用户等级
     * data class AuthBean(val id: String, val token: String, val level: Int)
     * */
    getAuthBean(): AuthBean | undefined {
        const key = WxAuthHelper.getKey()

        let value = sessionStorage.getItem(key)
        if (!value) {
            value = localStorage.getItem(key)
            if (!!value) {
                sessionStorage.setItem(key, value)
            } else {
                console.log("no value in storage for key=" + key)
                return undefined
            }
        }
        return JSON.parse(value)
    },


    /**
     * 获取登录后的请求头
     * use-http会额外添加application/json请求头，故此处注释掉
     */
    getHeaders(): {} | undefined {
        const authBean = WxAuthHelper.getAuthBean()
        const isWxWorkApp = WebAppHelper.isWxWorkApp()
        if (authBean) {
            let header: MyHeaders = {
                // 'Content-Type': 'application/json',
                // 'Accept': 'application/json',
                "Authorization": 'Bearer ' + authBean.token
            }

            if (authBean.uId) header["X-Auth-uId"] = authBean.uId
            if(isWxWorkApp){
                if (authBean.openId2) header["X-Auth-oId"] = authBean.openId2
                if (authBean.userId) header["X-Auth-UserId"] = authBean.userId
                if (authBean.externalUserId) header["X-Auth-ExternalUserId"] = authBean.externalUserId
                if (authBean.suiteId) header["X-Auth-SuiteId"] = authBean.suiteId
                if (authBean.corpId) header["X-Auth-CorpId"] = authBean.corpId
                if (authBean.agentId) header["X-Auth-AgentId"] = authBean.agentId
            } else{
                if (authBean.openId1) header["X-Auth-oId"] = authBean.openId1
                if (authBean.unionId) header["X-Auth-unId"] = authBean.unionId
            }
            
            return header
        }else{
            const authBean2 = WxGuestAuthHelper.getAuthBean()
            if(authBean2){
                let header2: MyHeaders = {}
                if(isWxWorkApp){
                    if (authBean2.openId2) header2["X-Auth-oId"] = authBean2.openId2
                    if (authBean2.userId) header2["X-Auth-UserId"] = authBean2.userId
                    if (authBean2.externalUserId) header2["X-Auth-ExternalUserId"] = authBean2.externalUserId
                    if (authBean2.suiteId) header2["X-Auth-SuiteId"] = authBean2.suiteId
                    if (authBean2.corpId) header2["X-Auth-CorpId"] = authBean2.corpId
                    if (authBean2.agentId) header2["X-Auth-AgentId"] = authBean2.agentId
                } else{
                    if (authBean2.openId1) header2["X-Auth-oId"] = authBean2.openId1
                    if (authBean2.unionId) header2["X-Auth-unId"] = authBean2.unionId
                }
                return header2
            }else 
            return undefined
        }
    }
}

interface MyHeaders{
    "Authorization"?: string | undefined
    "X-Auth-uId"?: string | undefined
    "X-Auth-oId"?: string | undefined
    "X-Auth-unId"?: string | undefined
    "X-Auth-UserId"?: string | undefined
    "X-Auth-ExternalUserId"?: string | undefined
    "X-Auth-SuiteId"?: string | undefined
    "X-Auth-CorpId"?: string | undefined
    "X-Auth-AgentId"?: number | undefined
}

export function saveState(state: string) {
    const key = `${AppKeyPrefix}/sys/state`
    sessionStorage.setItem(key, state)
}

export function getState(): string | null {
    const key = `${AppKeyPrefix}/sys/state`
    const state = sessionStorage.getItem(key)
    sessionStorage.removeItem(key)
    return state
}

export function saveFrom(from: string) {
    const key = `${AppKeyPrefix}/sys/from`
    sessionStorage.setItem(key, from)
}

export function getFrom(): string | null {
    const key = `${AppKeyPrefix}/sys/from`

    const state = sessionStorage.getItem(key)
    sessionStorage.removeItem(key)
    return state
}

// export function saveState(state: string,corpId?:string, agentId?: number, ){
//     const corpId2 = corpId || 'NoCorpId'
//     const agentId2 = agentId || 0
//     sessionStorage.setItem(`${corpId2}/${agentId2}/state`, state)
// }

// export function getState(corpId?:string, agentId?: number): string|null  
// {
//     const corpId2 = corpId || 'NoCorpId'
//     const agentId2 = agentId || 0
//     const key = `${corpId2}/${agentId2}/state`
//     const state = sessionStorage.getItem(key)
//     sessionStorage.removeItem(key)
//     return state
// }

// export function saveFrom(from: string,corpId?:string, agentId?: number){
//     const corpId2 = corpId || 'NoCorpId'
//     const agentId2 = agentId || 0
//     const key = `${corpId2}/${agentId2}/from`
//     sessionStorage.setItem(key, from)
// }

// export function getFrom(corpId?:string, agentId?: number): string|null  
// {
//     const corpId2 = corpId || 'NoCorpId'
//     const agentId2 = agentId || 0
//     const key = `${corpId2}/${agentId2}/from`
//     const state = sessionStorage.getItem(key)
//     sessionStorage.removeItem(key)
//     return state
// }