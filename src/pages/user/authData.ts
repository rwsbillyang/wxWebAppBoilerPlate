
/**
 * 用于从url中提取路径中的参数，oauth认证时，需要知道是哪个公众号，
 * 或者哪个企业微信的agent
 */
 export interface CorpParams{
    appId?: string, //公众号 appId
    corpId?: string, //企业微信 corpId
    suiteId?: string,
    agentId?: number
}


export interface GuestOAuthBean{
    unionId?: string,// 公众号
    openId?: string, // 公众号和企业微信的访客openId

    //企业微信
    userId?: string, //企业微信内部员工userid
    externalUserId?: string,//企业微信外部成员id
    corpId?: string,
    agentId?: number,
    suiteId?: string
}

export interface AuthBean extends GuestOAuthBean{
    uId: string, //account._id
    token: string, //系统注册用户登录后，才有值
    level: number, // 当前edition level 可能已过期
    permittedlevel?: number, // 操作权限，过期后降为免费权限
    expire?: number, //utc time
    role?: string[], //若为空，自动赋值 "user"

    avatar?: string,
    qrCode?: string  
}