
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
    keyword?: string,
    lastId?: string
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
            f7.toast.show({ text: msg })
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
            f7.toast.show({ text: msg })
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
            const data = getDataFromBox(box)
            if (box.code === CODE.OK) {
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
                const data = getDataFromBox(box)
                if (box.code === CODE.OK) {
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
 * 需要从远程加载的情况：点击loadMore按钮（每次加载完毕合并旧数据后缓存全部）、搜索（不缓存结果）、
 * 调用者认为需要强制刷新(不合并结果，只缓存结果)的情景比如下拉刷新,通过fetchDataFromRemote直接请求，并给其一个回调
 * 
 * 需要从本地加载的情况：首次进入、再次进入，清除搜索条件后恢复原状，tab切换（相当于新进入），都先从缓存加载，为空时再从远程加载
 * 
 * bug：首次进入，从cache中加载，无数据，继续从远程加载，加载后设置跳过cache，故再点击加载更多工作正常；
 * 但再次进入时，仍首先从cache中加载，cache中有数据，直接返回，再点击加载更多，依然从cache中加载一遍，数据是旧数据，显示的是旧数据，因此无法加载更多数据。
 * fix：所有查询条件继承自ListQueryBase，当有lastId字段时表示加载更多，当有keword时表示搜索；不提供setIsSearching,setSkipCache等函数进行设置。
 * 后端需要统一为接受lastId和keyword字段

 * @param listKey 不传递key则不使用cache
 * @param url 请求数据url
 * @param queryParams 列表查询条件
 * @param needLoadMore //分页数据为true，全部数据为false 用于查询全部数据的情况
 * @param storageType 缓存类型 default: sessionStorage
 */
export function useCacheList<T, P extends ListQueryBase>(
    listKey: string,
    url: string,
    queryParams?: P,
    needLoadMore: boolean = true, //分页数据为true，全部数据为false
    storageType: number = StorageType.OnlySessionStorage
) {
    const [list, setList] = useState<T[]>();
    const [query, setQuery] = useState<P|undefined>(queryParams) //请求查询条件变化将导致重新请求
    const [isLoading, setIsLoading] = useState(true); //加载状态
    const [isError, setIsError] = useState(false); //加载是否有错误
    const [errMsg, setErrMsg] = useState<string>() //加载错误信息
    const [loadMoreState, setLoadMoreState] = useState(getLoadMoreState(listKey)) //加载更多 按钮状态：可用和不可用，自动被管理，无需调用者管理
    const [refresh, setRefresh] = useState<number>() //refresh只要改变就会引起获取值的操作。当为0时表示从远程获取，其它值则从本地获取

    const [currentPage, setCurrentPage] = useState(1)

    //从远程加载数据，会动态更新加载状态、是否有错误、错误信息
    //加载完毕后，更新list，自动缓存数据（与现有list合并）、设置加载按钮状态
    const fetchDataFromRemote = (query?: P, onDone?:(data?: T[])=>void, isMergeResult: boolean = false) => {
        if(DebugCache) console.log("fetch from remote...for key="+listKey)
        
        get(url,  query?.pagination? {...query, umi: encodeUmi({...query.pagination, current: currentPage}), pagination: undefined} : query)
            .then(res => {
                setIsLoading(false)
                const box: DataBox<T[]> = res.data
                const data = getDataFromBox(box)
                if (box.code === CODE.OK) {
                    if (data) {
                        setIsError(false)

                        const result = (isMergeResult && list && list.length > 0) ? list.concat(data) : data
                        setList(result)
                        if(!query?.keyword){ //非搜索，缓存搜索结果
                            saveItem(listKey, JSON.stringify(result), storageType)
                        }

                        if(needLoadMore){
                            const newState = data.length >= PageSize
                            setLoadMoreState(newState)
                            saveLoadMoreState(listKey, newState)
                            //setSkipCache(true) //一旦有过请求数据，再请求(加载更多)就跳过cache，除非点击tab重置了
                        }
                        
                    } else {
                        setIsError(true)
                        if(needLoadMore){
                            setErrMsg("没有数据了")
                            saveLoadMoreState(listKey, false)
                            setLoadMoreState(false)
                        }
                        
                    }
                } else {
                    setIsError(true)
                    if(needLoadMore){
                        saveLoadMoreState(listKey, false)
                        setLoadMoreState(false)
                    }
                    setErrMsg(box.msg || box.code)
                    
                }

                //报告数据请求结束
                if(onDone) onDone(data)
            })
            .catch(err => {
                //报告数据请求结束
                if(onDone) onDone()

                setIsLoading(false)
                setIsError(true)
                setErrMsg(err.message)
                if(needLoadMore){
                    saveLoadMoreState(listKey, false)
                    setLoadMoreState(false)
                } 
            })
    }

    useEffect(() => {
        if(DebugCache) console.log("in useEffect loading: currentPage="+currentPage+", refresh="+refresh+", url="+url+", query="+JSON.stringify(query))
        //setList(undefined) 应由调用者重置list，因为在加载更多时，不能重置list；调用者判断是正常加载还是加载更多，决定是否重置list
        setIsLoading(true)
        if(query?.lastId || query?.keyword || refresh == 1 || currentPage > 1){ //首次搜索不合并结果
            if(DebugCache) console.log("lastId or keyword or refresh, or currentPage > 1 , try from remote...")
            fetchDataFromRemote(query, undefined, !!query?.lastId || currentPage > 1)//只有加载更多需合并结果，无论是否在搜索
        }else{
            const v = getItem(listKey, storageType)
            if (v) {
                if(DebugCache) console.log("fetch from local cache...,refresh="+refresh+", key="+listKey)
                setList(JSON.parse(v))
                setIsLoading(false)
            } else {
                if(DebugCache) console.log("no local cache, try from remote...")
                fetchDataFromRemote(query)//无缓存时合并和不合并没有意义，干脆不合并
            }
        } 
     
    }, [url, query, refresh, currentPage])// url, query, refresh变化，导致重新请求. refresh值变化导致重新取数据

    return { isLoading, isError, errMsg, loadMoreState, query, setQuery, list, setList, fetchDataFromRemote, refresh, setRefresh, currentPage, setCurrentPage}
}




/**
 * 获取sessionStorage中缓存的loadMore状态
 * @param key 列表的缓存key，后面会自动加'/loadMore'
 */
function getLoadMoreState(listKey: string) {
    const key = listKey + '/loadMore'
    const cached = sessionStorage.getItem(key)

    return (cached && cached === '0') ? false : true
}
function saveLoadMoreState(listKey: string, state: boolean) {
    const key = listKey + '/loadMore'
    sessionStorage.setItem(key, state ? '1' : '0')
}


export function getItem(key: string, storageType: number = StorageType.OnlySessionStorage,  defaultValue?: string) {
    let v: string | null | undefined = undefined
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

export function saveItem(key: string, v: string, storageType: number = StorageType.OnlySessionStorage) {
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


export const evictCache = (key: string, storageType: number = StorageType.OnlySessionStorage) => {
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
export function onAddOne<T>(key: string, e: T,  storageType: number = StorageType.OnlySessionStorage){
    const str = getItem(key)
    if (str) {
        const arry: T[] = JSON.parse(str)
        if (arry && arry.length > 0){
            arry.unshift(e)
            saveItem(key, JSON.stringify(arry))
        }else
            saveItem(key, JSON.stringify([e]))
    } else
        saveItem(key, JSON.stringify([e]))

}

/**
 * 编辑后修改缓存, 必须以_id作为键值进行比较
 */
 export function onEditOne<T> (key: string, e: T ) {
    const str = getItem(key)
    if (str) {
        let arry: T[] = JSON.parse(str)
        if (arry && arry.length > 0) {
            //搜索现有列表，找到后更新
            for (let i = 0; i < arry.length; i++) {
                if (arry[i]["_id"] === e["_id"]) {
                    console.log("update one: id=" + e["id"])
                    arry[i] = e
                    break;
                }
            }
            saveItem(key, JSON.stringify(arry))
        }
    }
}


/**
 * 编辑后修改缓存, 必须以_id作为键值进行比较
 */
 export function onDelOne<T>(key: string, _id: string) {
    const str = getItem(key)
    if (str) {
        let arry: T[] = JSON.parse(str)
        if (arry && arry.length > 0) {
            //搜索现有列表，找到后删除
            for (let i = 0; i < arry.length; i++) {
                if (arry[i]["_id"] === _id) {
                    console.log("del one: id=" + _id)
                    arry.splice(i, 1)
                    saveItem(key, JSON.stringify(arry))
                    return arry;
                }
            }
        }
    }
    return undefined
}
