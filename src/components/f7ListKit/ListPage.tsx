import React, { useEffect } from 'react';
import {
    Page,
    Button,
    Toolbar,
    Navbar,
    ListItem,
    SwipeoutActions,
    SwipeoutButton,
    f7,
    List,
    Icon,
} from 'framework7-react';

//https://www.npmjs.com/package/use-bus
import useBus, { dispatch } from 'use-bus'

import { TextBack } from '@/config';

import { fetchDiscachely, getItem, ListQueryBase, onDelOne, StorageType, useCacheList } from '@/request/useCache';

import { LoadMore, NoDataOrErr } from '@/components/LittleWidget';
import { get } from '@/request/myRequest';
import { ItemBase, ListPageProps } from './data';
import { FieldMeta, MyListItemProps, MyListProps } from './MyF7Props';
import { SearchView } from './SearchView';


export function deleteOne<T extends ItemBase>(pageProps: ListPageProps<T>, id?: string) {
    if (!id) {
        f7.dialog.alert("no id")
        return
    }
    f7.dialog.confirm('删除后不能恢复，确定要删除吗？', () => {
        fetchDiscachely<number>(
            () => get(pageProps.delApi + "/" + id),
            () => {
                console.log("successfully del:" + id)
                onDelOne(pageProps.cacheKey, id)

                dispatch("refreshList-" + pageProps.id) //删除完毕，发送refreshList，告知ListView去更新
            })
    })
}

/**
 * 列表页，点击跳转时会附带上item，跳转链接的后面会附带上_id；编辑时也会附带上item，跳转链接中无_id, 新增时会附带上预置的字段值；删除时，delApi后直接添加id
 * 
 * @param pageProps Page页面属性，
 * @param listProps  F7的List组件的属性，如指定mediaList
 * @param listItemPropsFunc 用于构建ListItem中的属性，如title， subtitle，after，text，after等
 * @param initialValue 传入的初始数据，用于新增时将一些非编辑的其它参数传递进来。如新增公众号菜单时，需要将当前公众号appId传递进来 用Partial主要因为新增时大部分字段为空
 * @param initialQuery 列表查询条件 为空则表示未指定
 * @param listItemSlotViewFunc 如果ListItem的属性函数listItemPropsFunc不能满足要求，可以使用listItemSlotViewFunc指定slot，还不满足要求，可使用CustomListView
 * @param CustomListView 当<List>以及listItemPropsFunc和listItemSlotViewFunc不能满足要求时，自行提供一个List
 * @param MyNavBar 自定义NavBar，额外的操作菜单
 * @param addMax 新增次数限制
 * @param searchFields 需要搜索时，传递过来的搜索字段
 * @returns 返回具备LoadMore的列表页面,支持修改或删除后对缓存的刷新
 */
//export const CommonListPage: React.FC<{listProps: ListPageProps, titleFunc:(e: T)=>string, initialQuery?: Q}> = ({listProps, titleFunc, initialQuery}) => {
export function CommonListPage<T extends ItemBase, Q extends ListQueryBase>
    (
        pageProps: ListPageProps<T>,
        listProps?: MyListProps,
        listItemPropsFunc?: (e: T) => MyListItemProps,
        initialValue?: Partial<T>,
        initialQuery?: Q,
        listItemSlotViewFunc?: (e: T, pageProps: ListPageProps<T>) => JSX.Element,
        CustomListView?: React.FC<{ list: T[], pageProps: ListPageProps<T> }>,
        MyNavBar?: React.FC<{ pageProps: ListPageProps<T>, initialValue?: Partial<T> }>,
        addMax?: number,
        searchFields?: FieldMeta<T>[],
) {

    let currentQuery: Q = { ...initialQuery } as Q
    //如果指定了存储，则试图从localStorage中加载
    if (pageProps.initalQueryKey) {
        const v = getItem(pageProps.cacheKey + pageProps.initalQueryKey, StorageType.OnlyLocalStorage)
        if (v) currentQuery = JSON.parse(v) || initialQuery
    }

    const { isLoading, isError, errMsg, loadMoreState, query, setQuery, list, refresh, setRefresh,  setUseCache , setIsLoadMore}
        = useCacheList<T, Q>(pageProps.cacheKey, pageProps.listApi, currentQuery, pageProps.needLoadMore === false ? false: true)

    //console.log("CommonListPage: currentQuery=" + JSON.stringify(currentQuery))

    //从缓存中刷新
    useBus('refreshList-' + pageProps.id, () => setRefresh(refresh + 1), [refresh])

    //修改后重新加载数据, 因为需要刷新数据，故没有将List提取出来作为单独的component
    const pageReInit = () => {
        //console.log("pageReInit, refresh=" + refresh)
        setRefresh(refresh + 1)
        document.title = pageProps.name + "列表"
    }
    useEffect(() => {
        document.title = pageProps.name + "列表"
    }, [])


    const defaultListItemPropsFunc = (itemValue: T) => {
        const props: MyListItemProps = {
            title: itemValue["name"] || itemValue["_id"],
            swipeout: pageProps.pureReadOnly === undefined || !pageProps.pureReadOnly,
            routeProps: { item: itemValue, isAdd: "0" },
            //link: pageProps.clickPath ? pageProps.clickPath(itemValue) : undefined
        }
        return props
    }

    const defaultItemSlotViewFunc = (itemValue: T, pageProps: ListPageProps<T>) => {
        return (pageProps.pureReadOnly === undefined || !pageProps.pureReadOnly) ?
            <SwipeoutActions left>
                <SwipeoutButton color="yellow" close onClick={() => {
                    if (pageProps.editPath)
                        f7.views.main.router.navigate(pageProps.editPath(itemValue), { props: { item: itemValue, isAdd: "0" } })
                }}>编辑</SwipeoutButton>
                {pageProps.delApi && <SwipeoutButton color="red" close onClick={() => deleteOne(pageProps, itemValue._id)}>删除</SwipeoutButton>}
            </SwipeoutActions> : null

    }


    const itemPropsFunc = listItemPropsFunc || defaultListItemPropsFunc
    const itemSlotFunc = listItemSlotViewFunc || defaultItemSlotViewFunc

   

    return <Page name={pageProps.id} id={pageProps.id}
        noNavbar={!pageProps.hasNavBar}
        stacked={false}
        onPageReinit={pageReInit}
    >
        {pageProps.hasNavBar && (MyNavBar? <MyNavBar pageProps={pageProps} initialValue={initialValue}/> : <Navbar title={pageProps.name} backLink={pageProps.noBackLink ? undefined : TextBack} />)}

        {
            (searchFields && searchFields.length > 0) && SearchView(searchFields, setUseCache, setQuery, initialQuery, currentQuery, pageProps.initalQueryKey ? pageProps.cacheKey + pageProps.initalQueryKey : undefined)
        }

        {
            (list && list.length > 0) ?
                <>
                    {CustomListView ? <CustomListView list={list} pageProps={pageProps} />
                        : <List {...listProps}>
                            {list?.map((e: T, i: number) => {
                                return <ListItem key={e._id} {...itemPropsFunc(e)} swipeout={pageProps.pureReadOnly === undefined || !pageProps.pureReadOnly} routeProps={{ item: e }}>
                                    {itemSlotFunc(e, pageProps)}
                                </ListItem>
                            })}
                            {(pageProps.pureReadOnly === undefined || !pageProps.pureReadOnly) && <div slot="after-list" style={{ fontSize: "12px", color: "gray", textAlign: "center" }}>向右滑动列表可编辑或删除 </div>}
                        </List>}
                  {pageProps.needLoadMore !== false && <LoadMore
                        loadMoreState={loadMoreState}
                        isLoading={isLoading}
                        isError={isError}
                        errMsg={errMsg}
                        loadMore={() =>{
                            setUseCache(false)
                            setIsLoadMore(true)
                             //排序时，若指定了sortKey则使用指定的，否则默认使用_id
                            const sortKey = (!!query?.pagination?.sKey) ? query.pagination.sKey : "_id"
                            setQuery({ ...query as Q, lastId: (list && list.length > 0) ? list[list.length - 1][sortKey] : undefined })
                        }  
                        }
                    />}  
                </>
                : <NoDataOrErr isLoading={isLoading} isError={isError} errMsg={errMsg} />
        }
        {
            (pageProps.pureReadOnly !== true) &&
            <Toolbar bottom>
                <Button />
                <Button large disabled={addMax !== undefined && list && list.length >= addMax} href={pageProps.editPath ? pageProps.editPath(initialValue) : undefined} routeProps={{ isAdd: "1", item: initialValue }}><Icon f7="plus" />{"新增" + pageProps.name}</Button>
                <Button />
            </Toolbar>
        }

    </Page >
}
