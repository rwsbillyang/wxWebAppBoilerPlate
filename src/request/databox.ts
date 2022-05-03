
//****************************请求参数****************************/
/**
 * ProTable中request函数查询列表时的请求参数基类
 * 
 */
 export interface UmiListPagination{
    pageSize?: number;
    current?: number;
    sKey?: string; //sortKey
    sKeyType?: "TypeObjectId" | "TypeString" | "TypeNumber"; //排序的健不一定都是ObjectID类型，亦即lastId的后端类型，有可能是number或string类型，后端定义了三种类型：  TypeNumber  TypeString TypeObjectId
    sort?: number; //1用于升序，而-1用于降序
    fKey?: string; //filter key
    filters?: string[]
}
export const encodeUmi = (umi: UmiListPagination) => encodeURIComponent(JSON.stringify(umi))

//****************************请求结果****************************/
/**
 * 远程返回码，需与server端定义保持一致
 */
export enum CODE {
    OK = "OK",
    KO = "KO",
    NewUser = 'NewUser'
}

/**
 * API返回的数据封装基类
 * @param code 正确则为OK
 * @param msg 错误信息
 * @param type 参见 import { ErrorShowType } from 'umi'; 中的
 * <code>
 * export enum ErrorShowType {
 *  SILENT = 0, // 不提示错误
 *  WARN_MESSAGE = 1, // 警告信息提示
 *  ERROR_MESSAGE = 2, // 错误信息提示
 *  NOTIFICATION = 4, // 通知提示
 *  REDIRECT = 9, // 页面跳转
 * }
 *  </code>
 * @param tId traceId 用于调试
 * @param host 主机  用于调试
 */
export interface DataBoxBase {
    code: string,
    msg?: string
    type: number,
    tId?: string,
    host?: string
}
/**
 * API返回的数据封装
 * @param data 真正的荷载payload数据
 */
export interface DataBox<T> extends DataBoxBase {
    data?: T
}
/**
 * API返回的数据封装：列表数据
 * @param list 列表数据，真正的荷载payload数据
 * @param total 列表总条数，用于分页
 */
export interface DataBoxTableList<T> extends DataBoxBase {
    data?: T[],
    total: number
}


/**
 * 从DataBox中提取payload数据，无数据返回undefined
 * @param box DataBox
 */
export function getDataFromBox<T>(box: DataBox<T>): T | undefined {
    if (box) {
        if (box.code !== CODE.OK) {
            console.warn("getDataFromBox:" + JSON.stringify(box))
            //message.warning(box.msg)
            return undefined
        }
        return box.data
    }
    console.error("出错了，请求结果没有数据")
    return undefined
}
