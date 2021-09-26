import { KeyPrefix } from "@/config"
import { getItem, saveItem } from "@/request/useCache"
import { AuthBean, CorpParams, GuestOAuthBean } from "./authData"


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
    //同一个企业微信账户在切换到不同单位时，应该使用不同的登录数据和业务数据，因此缓存这些数据的key需要入口页url中的参数动
    //态变化，不可固定不变，否则导致数据不更新。这里通过入口页url中的参数来获取登录信息
    //将入口页url参数保存到session中，关闭后丢失，重新打开时重新设置
    setCorpParams(params: CorpParams) {
        saveItem(`${KeyPrefix}/corpParams`, JSON.stringify(params))
    },
    getCorpParams(): CorpParams | undefined {
        const p = getItem(`${KeyPrefix}/corpParams`)
        if (p) return JSON.parse(p)
        else return undefined
    },
    getKey(): string {
        const p = WxAuthHelper.getCorpParams()
        const corpId_ = p?.corpId || p?.appId || p?.suiteId || 'nocorp'
        const agentId_ = p?.agentId || 0
        const key = `${KeyPrefix}/${corpId_}/${agentId_}/auth`
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
    /**
     * 是否是系统管理员
     */
    isAdmin() {
        const authBean = WxAuthHelper.getAuthBean()
        if (authBean && authBean.uId && authBean.token && authBean.role) {
            for (let i = 0; i < authBean.role.length; i++) {
                if (authBean.role[i] === 'admin')
                    return true
            }
            console.log("not admin")
            return false
            //let flag = false
            //authBean.role.forEach(value => {if(value === 'admin') flag = true})

        } else {
            console.log("authBean not admin")
            return false
        }
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
        if (authBean) {
            let header: {
                "Authorization"?: string | undefined
                "X-Auth-uId"?: string | undefined
                "X-Auth-oId"?: string | undefined
                "X-Auth-unId"?: string | undefined
                "X-Auth-UserId"?: string | undefined
                "X-Auth-ExternalUserId"?: string | undefined
                "X-Auth-SuiteId"?: string | undefined
                "X-Auth-CorpId"?: string | undefined
                "X-Auth-AgentId"?: number | undefined
            } = {
                // 'Content-Type': 'application/json',
                // 'Accept': 'application/json',
                "Authorization": 'Bearer ' + authBean.token
            }

            if (authBean.uId) header["X-Auth-uId"] = authBean.uId
            if (authBean.openId) header["X-Auth-oId"] = authBean.openId
            if (authBean.unionId) header["X-Auth-unId"] = authBean.unionId
            if (authBean.userId) header["X-Auth-UserId"] = authBean.userId
            if (authBean.externalUserId) header["X-Auth-ExternalUserId"] = authBean.externalUserId
            if (authBean.suiteId) header["X-Auth-SuiteId"] = authBean.suiteId
            if (authBean.corpId) header["X-Auth-CorpId"] = authBean.corpId
            if (authBean.agentId) header["X-Auth-AgentId"] = authBean.agentId
            return header
        } else
            return undefined
    }
}


export function saveState(state: string) {
    const key = `${KeyPrefix}/sys/state`
    sessionStorage.setItem(key, state)
}

export function getState(): string | null {
    const key = `${KeyPrefix}/sys/state`
    const state = sessionStorage.getItem(key)
    sessionStorage.removeItem(key)
    return state
}

export function saveFrom(from: string) {
    const key = `${KeyPrefix}/sys/from`
    sessionStorage.setItem(key, from)
}

export function getFrom(): string | null {
    const key = `${KeyPrefix}/sys/from`

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