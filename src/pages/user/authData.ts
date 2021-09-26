
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

/**
 * only officialaccount
 * silentLogin 静默登录，目的是为更新VIP及expire信息
 * 因为 邀请有礼 得到奖励后，无法激活去获取最新登录信息，通过提示效果不明显
 * 只能 每次进入三个页面时，都登录一次，另一个好处，提高安全性：后端验证用户是否是最新token登录
 */
 export interface LoginParam {
    appId?: string
    from?: string
    needUserInfo?: boolean //oauth时用到，用于是否获取用户信息。false  明确不需要；true：明确需要；空：根据用户设置综合确定
    owner?: string // 用于判断用户设置是否获取用户信息
    silentLogin?: boolean //是否最新登录，有时候还需要使用最新的登录信息（与session同生命周期），若不是最新登录则静默登录一次
  }
  

  export interface OAuthInfo {
    appId: string, //corpId or suiteId
    redirectUri: string,
    scope: string,
    state: string,
    authorizeUrl: string,
    needUseInfo?: boolean
}


export interface GuestOAuthBean{
    appId?: string// 公众号
    unionId?: string,// 公众号
    openId?: string, // 公众号和企业微信的访客openId
    hasUserInfo?: boolean 

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



  