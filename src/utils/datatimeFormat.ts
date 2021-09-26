
// 对Date的扩展，将 Date 转化为指定格式的String 
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
export function dataFormat(date: Date, fmt: string) {    
    let myMap = new Map<string, number>();
    myMap.set("M+", date.getMonth() + 1); //月份 
    myMap.set("d+", date.getDate()); //日
    myMap.set("h+", date.getHours()); //小时 
    myMap.set("m+", date.getMinutes()); //分 
    myMap.set("s+", date.getSeconds()); //秒 
    myMap.set("q+", Math.floor((date.getMonth() + 3) / 3)); //季度 
    myMap.set("S", date.getMilliseconds() )//毫秒 


    //console.log("format size="+ myMap.size)
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));

    myMap.forEach((value , key) =>{
       // console.log(`key=${key}, value=${value}`);
        if (new RegExp("(" + key + ")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? value.toString() : (("00" + value).substr(("" + value).length)));
        }
    });

    return fmt;
}

/**
 * 格式UTC时间 输出形如： 2019-12-02 08:09:04
 * */
export const formatYearDateTime = (time?: number) => {
    if(!time) return ''
    const date = new Date(time)
    return dataFormat(date, "yyyy-MM-dd hh:mm:ss")
}

/**
  * 格式UTC时间 输出形如： 12-02 08:09:04
  * */
 export const formatDateTime = (time?: number) => {
    if(!time) return ''
    const date = new Date(time)
    return dataFormat(date, "MM-dd hh:mm:ss")
}


export const formatDate = (time?: number) => {
    if(!time) return ''
    const date = new Date(time)
    return dataFormat(date, "MM月dd日")
}

export const isExpire = (time?: number) => {
    if(!time) return true

    return Date.now() > time
}
export const expireInfo = (time?: number) => {
    if(!time) return ''
    const date = new Date(time)
    const str = dataFormat(date, "yyyy年MM月dd日")
    return Date.now() > time ?'[已过期]'+str:'到期：'+str
}

/**
 * TODO: 格式化
 * @param duration 单位秒
 */
export const formatDuration = (duration?: number, attachPrompt: boolean = true, prefix="阅读：") => {
    if(!duration) return ""

    const hours = Math.floor(duration / 3600)
    const minitues = Math.floor((duration - hours*3600)/60)
    const seconds = Math.floor(duration - hours*3600 -  minitues*60)
    
    let str = attachPrompt ? prefix:""
    if(hours > 0) str+=hours+"小时"
    if(minitues > 0) str+=minitues+"分"
    if(seconds > 0) str+=seconds+"秒"
    return str
}
