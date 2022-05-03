
import { ItemBase } from "@/components/f7ListKit/data";
import { WebAppHelper } from "@/user/WebAppHelper";
import { f7 } from "framework7-react"
import { useEffect, useState } from "react";
import { CODE, DataBox, encodeUmi, getDataFromBox, UmiListPagination } from "./databox"
import { get } from "./myRequest";

//后端默认为10，若需修改，需在前端提交umi数据，并设置此处的PageSize
export const PageSize = 10

const DebugCache = false


export interface ListQueryBase {
    pagination?: UmiListPagination
    umi?: string,
    lastId?: string
  }

//支持通过应用（appId）区分列表数据 
export interface ListQueryForApp extends ListQueryBase {
    appId: string
}

/**
 * 只显示loading普通的请求，不进行cache
 * 
 * 限制：依赖f7进行loading显示，依赖databox结果格式
 * 
 * @param loadFunc 请求promise
 * @param onOK 正确且有数据后的操作
 * @param onFail 出错后的错误提示：不提供的话，将使用默认的toast进行提示错误msg；提供的话，先执行提供的，再执行toast错误提示
 * @param onNoData 无数据时的操作： 不提供的话，无任何操作
 */
export function fetchDiscachely<T>(
    loadFunc: () => Promise<any>,
    onOK: (data: T) => void = () => f7.toast.show({ text: "操作成功" }),
    onFail?: ((msg: string) => void),
    onNoData?: () => void,
    showLoader: () => void = () => f7.preloader.show(),
    hideLoader: () => void = () => f7.preloader.hide(),
) {
    return genericFetchCachely(
        loadFunc, 
        onOK, 
        true, 
        undefined,
        StorageType.NONE,
        onNoData,
        (msg) => {
            if (onFail) onFail(msg);
            else f7.toast.show({ text: msg })
        },
        showLoader,
        hideLoader
    )
}

/**
 * 使用缓存类型
 */
export const StorageType = {
    OnlySessionStorage: 1,
    OnlyLocalStorage: 2,
    BothStorage: 3,
    NONE: 0
}
/**
 * 缓存结果的请求
 * 
 * 限制：依赖f7进行loading显示，依赖databox结果格式
 * @param key 
 * @param loadFunc 从远程装载的函数
 * @param onOK 返回OK且有数据后的操作的数据处理函数
 * @param onNoData 没有数据时的处理函数： 不提供的话，无任何操作
 * @param onFail 出错后的错误提示：不提供的话，将使用默认的toast进行提示错误msg；提供的话，先执行提供的，再执行toast错误提示
 * @param storageType 存储类型：仅sessionStorage, 仅localStorage， 或者both
 */
export function fetchCachely<T>(
    key: string,
    loadFunc: () => Promise<any>,
    onOK: (data: T) => void,
    onNoData?: () => void,
    onFail?: (msg: string) => void,
    storageType: number = StorageType.OnlySessionStorage,
    onLoading = () => f7.preloader.show(),
    hideLoading =  () => f7.preloader.hide()
){
   return genericFetchCachely(loadFunc, onOK,  
        false, key , storageType,
        onNoData,
        (msg: string) => {
            if (onFail) onFail(msg);
            else f7.toast.show({ text: msg })
        },
        onLoading,
        hideLoading
    )
}



/**
 * 通用请求，可以配置是否cache，是否跳过cache，是否loading状态显示
 * 若有缓存，直接返回该值，否则通过回调返回该值
 * 
 * 限制：依赖databox结果格式
 * 
 * @param loadFunc 从远程装载的函数
 * @param onOK 返回OK的数据处理函数：正确且有数据后的操作
 * @param skipCache 某些情景，需要直接跳过cache，如加载更多
 * @param key 不传递key则不使用cache
* @param storageType 存储类型：仅sessionStorage, 仅localStorage， 或者both
 * @param onNoData 没有数据时的处理函数，提供才操作
 *  * @param onFail 返回失败的处理函数：非KO的操作
 * @param onLoading 显示loading的函数，提供才显示
 * @param hideLoading 隐藏loading的函数，提供才显示隐藏
 */
export function genericFetchCachely<T>(
    loadFunc: () => Promise<any>,
    onOK: (data: T) => void,
    skipCache: boolean = false, 
    key?: string,
    storageType: number = StorageType.OnlySessionStorage,
    onNoData?: () => void,
    onFail?: (msg: string) => void,
    onLoading?: () => void,
    hideLoading?: () => void
) {
    if (!skipCache && key) {
        const v = getItem(key, storageType)
        if (v) {
            onOK(JSON.parse(v))
            //return JSON.parse(v)
            return true
        }
    }

   if(onLoading) onLoading()

    loadFunc()
        .then(res => {
            if (hideLoading) hideLoading()
            const box: DataBox<T> = res.data
            if (box.code === CODE.OK) {
            const data = getDataFromBox(box)
                if(data === undefined){ //if(0)返回false if(data)判断有问题
                    if (onNoData) onNoData()
                }else{ 
                    if (key) {
                        saveItem(key, JSON.stringify(data), storageType)
                    }
                    onOK(data)
                }
                return false
            } else {
                if(onFail) onFail(box.msg || box.code)
                return false;
            }
        })
        .catch(err => {
            if (hideLoading) hideLoading()
            if(onFail) onFail(err.message)
            return false;
        })

    return false
}



/**
 * 不再推荐使用，推荐使用useCacheList
 * @param key 缓存key
 * @param url 请求地址
 * @param onOK 有数据时执行
 * @param setLoadMoreState 设置load more 状态的函数
 * @param initialData 初始数据，用于合并数据后缓存
 * @param query 查询参数
 * @param skipCache 是否跳过缓存，通常第一次请求时使用缓存，加载更多和搜索时不缓存
 * @param isSearch 是否搜索：搜索时不合并数据，不缓存数据
 * @param storageType 存储类型 localStorage sessionStorage
 * @param onNoData 没数据时执行的函数
 * @param onFail 有错误时的执行的函数
 * @param onLoading 显示
 * @param hideLoading 
 */
export function fetchListCachely<T>(
    key: string,
    url: string,
    onOK: (data: T[]) => void,
    setLoadMoreState?: (state: boolean) => void,
    initialData?: T[],
    query?: object | string | any[],
    skipCache: boolean = false, 
    isSearch: boolean = false, //搜索时不合并原有数据，不缓存数据
    storageType: number = StorageType.OnlySessionStorage,
    onNoData: () => void = () => f7.toast.show({text: "没有数据了"}),
    onFail: (msg: string) => void = (msg) => f7.toast.show({text: msg}),
    onLoading: () => void = ()=>f7.preloader.show(),
    hideLoading: () => void= ()=>f7.preloader.hide()
) {

    if(setLoadMoreState){
        setLoadMoreState(getLoadMoreState(key))
    }
    

    const fetchData = (query?: object | string | any[]) => {
        onLoading()
        get(url, query)
            .then(res => {
                hideLoading()
                const box: DataBox<T[]> = res.data
                if (box.code === CODE.OK) {
                const data = getDataFromBox(box)
                    if (data) {
                        onOK(data)
                        
                        //搜索时不合并原有数据，不缓存数据
                        if(!isSearch){
                            const mergedList = (initialData && initialData.length > 0) ? initialData.concat(data) : data
                            saveItem(key, JSON.stringify(mergedList), storageType)
                        }

                        if(setLoadMoreState){
                            const state = data.length >= PageSize
                            saveLoadMoreState(key, state)
                            setLoadMoreState(state)
                            //setList(mergedList)
                            //setSkipCache(true) //一旦有过请求数据，再请求(加载更多)就跳过cache，除非点击tab重置了
                        }
                        
                    } else {
                        onNoData()

                        if(setLoadMoreState){
                            saveLoadMoreState(key, false)
                            setLoadMoreState(false)
                        }
                        
                    }
                } else {
                    onFail(box.msg || box.code)

                    if(setLoadMoreState){
                        saveLoadMoreState(key, false)
                        setLoadMoreState(false)
                    }
                    
                }
            })
            .catch(err => {
                hideLoading()
                onFail(err.message)

                if(setLoadMoreState){
                    saveLoadMoreState(key, false)
                    setLoadMoreState(false)
                }
                
            })
    }

    //明确指定使用cache且不是在搜索
    if (!skipCache && !isSearch) {
        const v = getItem(key, storageType)
        if (v) {
            onOK(JSON.parse(v))
           // return JSON.parse(v)
           return true
        } else {
            fetchData(query)
        }
    } else {
        fetchData(query)
    }

    return true
}


/**
 *  请求列表数据的hook
 * 
 *  集成了isLoading, isError, errMsg, list, loadMoreState, setSkipCache（loadMore时需要设置跳过cache）, setQuery(导致重新请求)
 * 
 * 需要从远程加载的情况：下拉刷新(不合并结果，只缓存结果)、点击loadMore按钮加载更多（每次加载完毕合并旧数据后缓存全部），只有loadMore时需要合并数据结果
 * 每次从远程加载后，将开关设置回：isUseCache = true
 * 
 * 需要从本地加载的情况：其它情况均尝试从缓存加载，包括但不限于：首次进入、页面返回再次进入，tab切换（相当于新进入），都先从缓存加载，为空时再从远程加载
 *
 * @param listKey 不传递key则不使用cache
 * @param url 请求数据url
 * @param queryParams 列表查询条件
 * @param needLoadMore //分页数据为true，全部数据为false 用于查询全部数据的情况
 * @param storageType 缓存类型 default: sessionStorage
 */
export function useCacheList<T, Q extends ListQueryBase>(
    listKey: string,
    url: string,
    initalQuery?: Q,
    needLoadMore: boolean = true, //分页数据为true，全部数据为false
    storageType: number = StorageType.OnlySessionStorage
) {
    const [list, setList] = useState<T[]>();
    const [query, setQuery] = useState<Q>({ ...initalQuery } as Q) //请求查询条件变化将导致重新请求
    const [isLoading, setIsLoading] = useState(true); //加载状态
    const [isError, setIsError] = useState(false); //加载是否有错误
    const [errMsg, setErrMsg] = useState<string>() //加载错误信息
    const [loadMoreState, setLoadMoreState] = useState(getLoadMoreState(listKey)) //加载更多 按钮状态：可用和不可用，自动被管理，无需调用者管理

    const [useCache, setUseCache] = useState(true)//从远程加载后即恢复为初始值true，以后即从本地加载，需要远程加载时再设置：setUseCache(false)
    const [isLoadMore, setIsLoadMore] = useState(false)

    const [refresh, setRefresh] = useState<number>(0) //refresh用于刷新本地list数据, setQuery也能达到同样效果，但往往用于从远程加载
    // const [currentPage, setCurrentPage] = useState(1)

    //从远程加载数据，会动态更新加载状态、是否有错误、错误信息
    //加载完毕后，更新list，自动缓存数据（与现有list合并）、设置加载按钮状态
    const fetchDataFromRemote = (query?: Q, onDone?: (data?: T[]) => void) => {
        if (DebugCache) console.log("fetch from remote...for key=" + listKey + ", query=" + JSON.stringify(query))
        
        get(url, query?.pagination ? { ...query, umi: encodeUmi({ ...query.pagination }), sort: undefined, pagination: undefined } : { ...query, sort: undefined })
            .then(res => {
                setIsLoading(false)
                setUseCache(true)


                const box: DataBox<T[]> = res.data
                const data = getDataFromBox(box)
                if (box.code === CODE.OK) {
                    if (data) {
                        setIsError(false)

                        const result = (isLoadMore && list && list.length > 0) ? list.concat(data) : data
                        setList(result)
                            saveItem(listKey, JSON.stringify(result), storageType)                     

                        if(needLoadMore){
                            const newState = data.length >= (query?.pagination?.pageSize || PageSize)
                            setLoadMoreState(newState)
                            saveLoadMoreState(listKey, newState)
                        }
                        
                    } else {
                        setIsError(true)
                        if(needLoadMore){
                            setErrMsg("没有数据了")
                            saveLoadMoreState(listKey, false)
                        }
                        
                    }
                } else {
                    setIsError(true)
                    if(needLoadMore){
                        setLoadMoreState(false)
                        saveLoadMoreState(listKey, false)
                    }
                    setErrMsg(box.msg || box.code)
                    
                }

                //报告数据请求结束
                if(onDone) onDone(data)


                setIsLoadMore(false)//恢复普通状态，每次loadMore时再设置
            })
            .catch(err => {
                setUseCache(true)


                //报告数据请求结束
                if(onDone) onDone()

                setIsLoading(false)
                setIsError(true)
                setErrMsg(err.message)
                if(needLoadMore){
                    saveLoadMoreState(listKey, false)
                    setLoadMoreState(false)
                } 

                setIsLoadMore(false)//恢复普通状态，每次loadMore时再设置
            })
    }

    useEffect(() => {
        if (DebugCache) console.log("in useEffect loading, url=" + url + ", query=" + JSON.stringify(query))
        setIsLoading(true)
        if (useCache) {
            const v = getItem(listKey, storageType)
            if (v) {
                if (DebugCache) console.log("fetch from local cache... key=" + listKey)
                setList(JSON.parse(v))
                setIsLoading(false)
                setLoadMoreState(getLoadMoreState(listKey)) //从缓存加载了数据，也对应加载其loadMore状态
            } else {
                if(DebugCache) console.log("no local cache, try from remote...")
                fetchDataFromRemote(query)//无缓存时从远程加载
            }
        } else {
            if (DebugCache) console.log("useCache=false, try from remote...")
            fetchDataFromRemote(query)
        } 
     
    }, [url, query, refresh])// url, query, refresh变化

    return { isLoading, isError, errMsg, loadMoreState, query, setQuery, list, setList, fetchDataFromRemote, refresh, setRefresh, setUseCache, setIsLoadMore }
}




/**
 * 获取sessionStorage中缓存的loadMore状态
 * @param key 列表的缓存key，后面会自动加'/loadMore'
 */
function getLoadMoreState(shortKey: string) {
    const key = WebAppHelper.getKeyPrefix() + shortKey + '/loadMore'
    const cached = sessionStorage.getItem(key)

    return (cached && cached === '0') ? false : true
}
function saveLoadMoreState(shortKey: string, state: boolean) {
    const key = WebAppHelper.getKeyPrefix() + shortKey + '/loadMore'
    sessionStorage.setItem(key, state ? '1' : '0')
}


export function getItem(shortKey: string, storageType: number = StorageType.OnlySessionStorage, defaultValue?: string) {

    if (storageType === StorageType.NONE)
        return defaultValue

    let v: string | null | undefined = undefined
    const key = WebAppHelper.getKeyPrefix() + shortKey
    if (storageType === StorageType.OnlySessionStorage) {
        v = sessionStorage.getItem(key)
    } else if (storageType === StorageType.OnlyLocalStorage) {
        v = localStorage.getItem(key)
    }
    else if (storageType === StorageType.BothStorage) {
        v = sessionStorage.getItem(key)
        if (!v) {
            v = localStorage.getItem(key)
            if (v) sessionStorage.setItem(key, v)
        }
    }

    return v || defaultValue
}

export function saveItem(shortKey: string, v: string, storageType: number = StorageType.OnlySessionStorage) {
    if (storageType === StorageType.NONE)
        return
    const key = WebAppHelper.getKeyPrefix() + shortKey
    if (storageType === StorageType.OnlySessionStorage) {
        sessionStorage.setItem(key, v)
    } else if (storageType === StorageType.OnlyLocalStorage) {
        localStorage.setItem(key, v)
    }
    else if (storageType === StorageType.BothStorage) {
        sessionStorage.setItem(key, v)
        localStorage.setItem(key, v)
    }
}


export const evictCache = (shortKey: string, storageType: number = StorageType.OnlySessionStorage) => {
    const key = WebAppHelper.getKeyPrefix() + shortKey
    if (storageType === StorageType.OnlySessionStorage) {
        sessionStorage.removeItem(key)
    } else if (storageType === StorageType.OnlyLocalStorage) {
        localStorage.removeItem(key)
    }
    else if (storageType === StorageType.BothStorage) {
        sessionStorage.removeItem(key)
        localStorage.removeItem(key)
    }
}
export const evictAllCaches = (storageType: number = StorageType.OnlySessionStorage) => {
    if (storageType === StorageType.OnlySessionStorage) {
        sessionStorage.clear()
    } else if (storageType === StorageType.OnlyLocalStorage) {
        localStorage.clear()
    }
    else if (storageType === StorageType.BothStorage) {
        sessionStorage.clear()
        localStorage.clear()
    }
}


//修改列表数据缓存，当新增一个
export function onAddOne<T>(shortKey: string, e: T, storageType: number = StorageType.OnlySessionStorage) {
    if (storageType === StorageType.NONE)
        return


    const str = getItem(shortKey, storageType)
    if (str) {
        const arry: T[] = JSON.parse(str)
        if (arry && arry.length > 0){
            arry.unshift(e)
            saveItem(shortKey, JSON.stringify(arry))
        }else
            saveItem(shortKey, JSON.stringify([e]))
    } else
        saveItem(shortKey, JSON.stringify([e]))

    console.log("onAddOne done")
}

/**
 * 编辑后修改缓存, 必须以_id作为键值进行比较
 */
export function onEditOne<T extends ItemBase>(shortKey: string, e: T, storageType: number = StorageType.OnlySessionStorage) {
    if (storageType === StorageType.NONE)
        return

    const str = getItem(shortKey, storageType)
    if (str) {
        let arry: T[] = JSON.parse(str)
        if (arry && arry.length > 0) {
            //搜索现有列表，找到后更新
            for (let i = 0; i < arry.length; i++) {
                if (arry[i]["_id"] === e["_id"]) {
                    console.log("onEditOne : _id=" + e["_id"] + ", shortKey=" + shortKey)
                    arry[i] = e
                    saveItem(shortKey, JSON.stringify(arry))
                    return;
                }
            }
            console.log("onEditOne：not found in list _id=" + e["_id"] + ", shortKey=" + shortKey)
            return
        }
    }
    console.log("onEditOne：not found list: shortKey=" + shortKey)
}

//批量修改后的缓存更新
export function onEditMany<T extends ItemBase>(shortKey: string, list: T[], storageType: number = StorageType.OnlySessionStorage) {
    if (storageType === StorageType.NONE)
        return

    const str = getItem(shortKey, storageType)
    if (str) {
        let arry: T[] = JSON.parse(str)
        if (arry && arry.length > 0) {
            for (let j = 0; j < list.length; j++) {
                const e = list[j]
                //搜索现有列表，找到后更新
                for (let i = 0; i < arry.length; i++) {
                    if (arry[i]["_id"] === e["_id"]) {
                        arry[i] = e
                    }
                }
            }
            saveItem(shortKey, JSON.stringify(arry))
            return
        }else{
            saveItem(shortKey, JSON.stringify(list))
            return
        }
    }
    console.log("onEditMany: not found list, shortKey=" + shortKey)
}

export function ids2Data<T extends ItemBase> (ids: string[], list: T[]){
    const arry: T[] =  []
    for(let j=0;j<ids.length;j++){
        for (let i = 0; i < list.length; i++) {
            const e = list[i]
            if (e["_id"] === ids[j]) {
                 arry.push(e)
            }
        }
    }
    return arry   
}

export function findOneFromCache<T extends ItemBase>(shortKey: string, _id: string, storageType: number = StorageType.OnlySessionStorage) {
    if (storageType === StorageType.NONE)
        return undefined

    const str = getItem(shortKey, storageType)
    if (str) {
        let arry: T[] = JSON.parse(str)
        if (arry && arry.length > 0) {
            //搜索现有列表，找到后更新
            for (let i = 0; i < arry.length; i++) {
                if (arry[i]["_id"] === _id) {
                    //console.log("update one: id=" + _id)
                    return arry[i]
                }
            }
        }
    }
    return undefined
}


/**
 * 编辑后修改缓存, 必须以_id作为键值进行比较
 */
export function onDelOne<T>(shortKey: string, _id: string, storageType: number = StorageType.OnlySessionStorage) {
    if (storageType === StorageType.NONE)
        return undefined

    const str = getItem(shortKey)
    if (str) {
        let arry: T[] = JSON.parse(str)
        if (arry && arry.length > 0) {
            //搜索现有列表，找到后删除
            for (let i = 0; i < arry.length; i++) {
                if (arry[i]["_id"] === _id) {
                    console.log("del one: _id=" + _id)
                    arry.splice(i, 1)
                    saveItem(shortKey, JSON.stringify(arry))
                    return arry;
                }
            }
        }
    }
    return undefined
}
