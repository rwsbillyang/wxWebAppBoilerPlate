import { WxAuthHelper } from '@/user/WxOauthHelper';
import { request } from 'framework7';


const abortController = request.abortController();

//https://framework7.io/docs/request.html
export const get = (url: string, data?: object | string | any[]) => request({
    url: url,
    data: data,
    method: 'GET',
    dataType: 'json',
    contentType: 'application/x-www-form-urlencoded',
    headers: WxAuthHelper.getHeaders(),
    abortController
})

export const post = (url: string, data?: object | string | any[]) => request({
    url: url,
    data: data,
    method: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    headers: WxAuthHelper.getHeaders(),
    abortController  
})

/**
 * 用于将string转换成binary，通过upload上传一个字符串，后端ktor直接recive<String>解析出来；若直接上传，后端解析的字符串额外添加了引号
 * @param str 
 * @param cb 
 */
export function string2ArrayBuffer(str: string, cb: (buffer: ArrayBuffer)=>void) {
    var f = new FileReader();
    f.onload = function(e) {
        cb(f.result as ArrayBuffer);
    }
    f.readAsArrayBuffer(new Blob([str]));
}

export const upload = (url: string, data: ArrayBuffer) => request({
    url: url,
    data: data,
    processData: false,
    method: 'POST',
    dataType: 'json',
    contentType: 'application/octet-stream', //application/octet-stream multipart/form-data
    headers: WxAuthHelper.getHeaders(),
    abortController  
})


export const getWithouAuth = (url: string, data?: object | string | any[], async: boolean = true, crossDomain?: boolean) => request({
    url: url,
    data: data,
    async: async,
    crossDomain: crossDomain, //即使此处设置可以跨域，不被浏览器阻止，但对方服务器端没有设置允许跨域，依旧不能成功
    headers: crossDomain?{"Referrer-Policy": "no-referrer"}:undefined,
    method: 'GET',
    dataType: 'json',
    contentType: 'application/x-www-form-urlencoded',
    abortController
})

export const postWithouAuth = (url: string, data?: object | string | any[], crossDomain?: boolean) => request({
    url: url,
    data: data,
    crossDomain: crossDomain,
    headers: crossDomain?{"Referrer-Policy": "no-referrer"}:undefined,
    method: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    abortController
})
