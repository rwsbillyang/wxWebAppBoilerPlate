import { AppKeyPrefix, DEBUG } from "@/config"
import { getItem, saveItem } from "@/request/useCache"
import { f7 } from "framework7-react"
import { CorpParams } from "./AuthData"


export const WebAppHelper = {
    //同一个企业微信账户在切换到不同单位时，应该使用不同的登录数据和业务数据，因此缓存这些数据的key需要入口页url中的参数动
    //态变化，不可固定不变，否则导致数据不更新。这里通过入口页url中的参数来获取登录信息
    //将入口页url参数保存到session中，关闭后丢失，重新打开时重新设置
    setCorpParams(params: CorpParams) {
        const str = JSON.stringify(params)
        saveItem(`${AppKeyPrefix}/corpParams`, str)
    },
    getCorpParams(): CorpParams | undefined {
        const p = getItem(`${AppKeyPrefix}/corpParams`)
        if (p) return JSON.parse(p)
        else return undefined
    },
    isWxWorkApp(){
        if(DEBUG) console.log("isWxWorkApp call getCorpParams")
        const p = WebAppHelper.getCorpParams()
        if(p?.corpId && p?.agentId) return true //企业微信模式
        //if(p?.appId) return false //公众号模式
        if(DEBUG) console.log("no corpId or agentId, isWxWorkApp return false")
        return false //公众号模式
    },
    getKeyPrefix(): string{
        if(DEBUG) console.log("getKeyPrefix call getCorpParams")
        const p = WebAppHelper.getCorpParams()
        const corpId_ = p?.corpId || p?.appId || p?.suiteId || 'nocorp'
        const agentId_ = p?.agentId || 0
        const key = `${AppKeyPrefix}/${corpId_}/${agentId_}`
        return key
    },
    //prefix: ?, &
    getCorpParamsUrlQuery(prefix: string): string {
        if(DEBUG) console.log("getCorpParamsUrlQuery call getCorpParams")
        const p = WebAppHelper.getCorpParams()
        if (p) return prefix + f7.utils.serializeObject(p)
        else return ''
    },
}