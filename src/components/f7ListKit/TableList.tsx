import React, { useEffect } from 'react';
import { f7, Button, Page, Toolbar, Navbar, Icon, Block } from 'framework7-react';
import { ItemBase, ListPageProps } from './data';
import { TableCell } from './ListBatch';
import { getItem, ListQueryBase, StorageType, useCacheList } from '@/request/useCache';
import { FieldMeta } from './MyF7Props';
import useBus from 'use-bus';
import { SearchView } from './SearchView';
import { LoadMore, NoDataOrErr } from '../LittleWidget';
import { TextBack } from '@/config';


export interface OperationCallback<T extends ItemBase> {
    label: string
    needConfirm?: boolean
    confirmTip?: string //对话框提示
    callback: (selected: T) => void //批量操作执行动作
}



//批量操作，先选择后批量操作
export const TableList = <T extends ItemBase>(header: TableCell<T>[], data?: T[], operations?: OperationCallback<T>[]) => {

    return <div className="data-table"><table>
        <thead>
            <tr>
                {header.map((c) => <th className={c.className}>{c.label}</th>)}
                <th className="label-cell">操作</th>
            </tr>
        </thead>
        <tbody>
            {
                data?.map((e) => <tr>
                    {header.map((c) => <td className={c.className}>{c.cellValue(e)}</td>)}
                    <td className="label-cell"> {operations?.map((e2) => <Button onClick={() => {
                        if (e2.needConfirm === true)
                            f7.dialog.confirm(e2.confirmTip || '确定要操作吗？', () => e2.callback(e))
                        else e2.callback(e)
                    }}>{e2.label}</Button>)} </td>
                </tr>)
            }

        </tbody>
    </table></div>
}



export const TableListPage = <T extends ItemBase, Q extends ListQueryBase>(
    pageProps: ListPageProps<T>,
    header: TableCell<T>[],
    operations?: OperationCallback<T>[],
    initialValue?: Partial<T>,
    initialQuery?: Q,
    MyNavBar?: React.FC<{ pageProps: ListPageProps<T>, initialValue?: Partial<T> }>,
    addMax?: number,
    searchFields?: FieldMeta<T>[]) => {
        
    let currentQuery: Q = { ...initialQuery } as Q
    //如果指定了存储，则试图从localStorage中加载
    if (pageProps.initalQueryKey) {
        const v = getItem(pageProps.cacheKey + pageProps.initalQueryKey, StorageType.OnlyLocalStorage)
        if (v) currentQuery = JSON.parse(v) || initialQuery
    }

    const { isLoading, isError, errMsg, loadMoreState, query, setQuery, list, refresh, setRefresh, setUseCache, setIsLoadMore }
        = useCacheList<T, Q>(pageProps.cacheKey, pageProps.listApi, currentQuery, pageProps.needLoadMore === false ? false : true)

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

    return <Page name={pageProps.id} id={pageProps.id}
        noNavbar={!pageProps.hasNavBar}
        stacked={false}
        onPageReinit={pageReInit}
    >
        {pageProps.hasNavBar && (MyNavBar ? <MyNavBar pageProps={pageProps} initialValue={initialValue} /> : <Navbar title={pageProps.name} backLink={pageProps.noBackLink ? undefined : TextBack} />)}

        {
            (searchFields && searchFields.length > 0) && SearchView(searchFields, setUseCache, setQuery, initialQuery, currentQuery, pageProps.initalQueryKey ? pageProps.cacheKey + pageProps.initalQueryKey : undefined)
        }

        {
            (list && list.length > 0) ?
                <>
                    {TableList(header, list, operations)}

                    {pageProps.needLoadMore !== false &&<Block><LoadMore
                        loadMoreState={loadMoreState}
                        isLoading={isLoading}
                        isError={isError}
                        errMsg={errMsg}
                        loadMore={() => {
                            setUseCache(false)
                            setIsLoadMore(true)
                            //排序时，若指定了sortKey则使用指定的，否则默认使用_id
                            const sortKey = (!!query?.pagination?.sKey) ? query.pagination.sKey : "_id"
                            setQuery({ ...query as Q, lastId: (list && list.length > 0) ? list[list.length - 1][sortKey] : undefined })
                        }
                        }
                    /></Block>}
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
