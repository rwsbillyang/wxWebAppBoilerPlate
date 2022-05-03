

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
    //silentLogin?: boolean //是否最新登录，有时候还需要使用最新的登录信息（与session同生命周期），若不是最新登录则静默登录一次
    authStorageType?: number 
  }

  //登录类型，与后端保持一致
  export const LoginType = {
    ACCOUNT: "account", //账户密码
    MOBILE: "mobile", // 验证码，暂不支持
    WECHAT: "wechat", //微信登录
    WXWORK: "wxWork", //企业微信登录
    SCAN_QRCODE: "scanQrcode" //扫码或企业微信扫码登录，根据指定的参数appId/corpId&agentId
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
    openId1?: string, // 公众号访客openId
    hasUserInfo?: boolean 

    openId2?: string, // 企业微信访客openId
    //企业微信
    userId?: string, //企业微信内部员工userid
    externalUserId?: string,//企业微信外部成员id
    corpId?: string,
    agentId?: number,
    suiteId?: string,
    deviceId?: string
}

export interface AuthBean extends GuestOAuthBean{
    uId: string, //account._id
    token: string, //系统注册用户登录后，才有值
    level: number, // 当前edition level 可能已过期
    permittedlevel?: number, // 操作权限，过期后降为免费权限
    expire?: number, //utc time
    role?: string[], //若为空，自动赋值 "user"

    avatar?: string,
    nick?: string,
    qrCode?: string  
    ext?: string //扩展字段，如推广模式：个人品牌，产品广告等

    miniId?: string //小程序 appId
    gId?: string[] //所属群组
}

