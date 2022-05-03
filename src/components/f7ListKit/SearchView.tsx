import React, { SyntheticEvent, useState } from 'react';
import {
    Button,
    ListItem,
    List,
    CardContent,
    Card,
    CardFooter,
    Toggle,
    ListInput,
    f7,
    Link,
} from 'framework7-react';


import { evictCache, ListQueryBase, saveItem, StorageType } from '@/request/useCache';
import { ItemBase, SelectOption, SortOption } from './data';
import { FieldMeta } from './MyF7Props';
import { AsynSelectInput } from '../AsyncSelectInput';
import { dispatch } from 'use-bus';

//https://stackoverflow.com/questions/53958028/how-to-use-generics-in-props-in-react-in-a-functional-component
//initalQueryShortKey = pageProps.cacheKey+pageProps.initalQueryKey
//export function useSearchView<T extends ItemBase, Q extends ListQueryBase>
// (
//     searchKFields: FieldMeta<T>[], 
//     setQuery: React.Dispatch<React.SetStateAction<Q | undefined>>,
//     initalQuery?: Q
//     )
// {
/**
 * 
 * @param searchFields 指定的哪些字段可搜索
 * @param setQuery 当搜索时，设置query，触发从远程查询
 * @param initalQuery 用于重置
 * @param currentQuery 当前查询条件
 * @param initalQueryShortKey 若给定了缓存键，则缓存搜索条件
 * @returns 
 */
export const SearchView = <T extends ItemBase, Q extends ListQueryBase>(
    searchFields: FieldMeta<T>[],
    setUseCache: React.Dispatch<React.SetStateAction<boolean>>,
    setQuery: React.Dispatch<React.SetStateAction<Q>>,
    initalQuery?: Q, currentQuery?: Q, initalQueryShortKey?: string) => {

    const [dirty, setDirty] = useState(false)

    const [searchQuery, setSearchQuery] = useState({ ...currentQuery } as Q)

    //console.log("searchQuery="+JSON.stringify(searchQuery))

    const metaToInput = (e: FieldMeta<T>, i: number) => {
        e.required = false
        //e.validate = false
        //e.pattern = undefined
        e.errorMessage = undefined
        //console.log("label="+e.label + ", isDisplay="+isDisplay + ",item="+JSON.stringify(item))
        switch (e.type) {
            case 'object':
                return null
            case 'datepicker':
                return null
            case "radio":
                return <ListItem key={i}>
                    <span>{e.label}</span>
                    <Toggle checked={searchQuery[e.name]}
                        onToggleChange={(newValue: boolean) => {
                            if (searchQuery[e.name] !== newValue) {
                                searchQuery[e.name] = newValue
                                setDirty(true)
                                setSearchQuery({ ...searchQuery })
                            }

                        }} ></Toggle>
                </ListItem>
            case 'asyncSelect':
                return AsynSelectInput({ ...e, value: searchQuery[e.name] },
                    (newValue?: string | number) => {
                        if (searchQuery[e.name] !== newValue) {
                            searchQuery[e.name] = newValue
                            setDirty(true)
                            setSearchQuery({ ...searchQuery }) //使用value，则需重置state
                        }
                    }, e.asyncSelectProps)
            case 'sort':
                e.type = "select"
                return e.sortOptions ? <ListInput key={i}
                    {...e}
                    value={searchQuery[e.name] || ''}
                    onChange={(event: SyntheticEvent) => {
                        const target = event.target as HTMLInputElement
                        const newValue = target.value

                        if (searchQuery[e.name] !== newValue) {
                            console.log("newValue=" + newValue)
                            searchQuery[e.name] = newValue
                            setDirty(true)

                            const pagination = e.sortOptions?.find(e => e.pagination?.sKey === newValue)?.pagination

                            setSearchQuery({ ...searchQuery, pagination: pagination }) //使用value值，则需重置state
                        }
                    }}
                > {e.sortOptions?.map((option: SortOption, i: number) => <option key={i} value={option.pagination?.sKey}>{option.label}</option>)}
                </ListInput> : null
            default:
                // if(e.type !== 'select') e.clearButton = true

                return <ListInput key={i}
                    {...e}
                    //defaultValue={searchQuery[e.name] || ''}
                    value={searchQuery[e.name] || ''}
                    onChange={(event: SyntheticEvent) => {
                        const target = event.target as HTMLInputElement
                        const newValue = target.value.trim()

                        if (searchQuery[e.name] !== newValue) {
                            console.log("newValue=" + newValue)
                            searchQuery[e.name] = newValue
                            setDirty(true)
                            setSearchQuery({ ...searchQuery }) //使用value值，则需重置state
                        }
                    }}
                    onInputClear={() => {

                        console.log("onInputClear: searchQuery[e.name]=" + searchQuery[e.name])
                        if (searchQuery[e.name]) { //第一次点击clear button时只是获取焦点，但此回调也会被回调，故不能使用此判断，或直接去掉clear button
                            console.log("onInputClear takes effect, searchQuery[e.name] is cleared")
                            searchQuery[e.name] = undefined
                            setDirty(true)
                            setSearchQuery({ ...searchQuery }) //使用value值，则需重置state
                        }

                    }}
                >
                    {e.type === 'select' && e.selectOptions?.map((option: SelectOption, i: number) => <option key={i} value={option.value === undefined ? option.label : option.value}>{option.label}</option>)}
                </ListInput>
        }
    }


    return (
        <Card>
            <CardContent padding={false}>
                <List inlineLabels noHairlinesMd>
                    {
                        searchFields.map(metaToInput)
                    }
                </List>
            </CardContent>
            <CardFooter >
                <Link onClick={() => {
                    if (initalQueryShortKey)
                        evictCache(initalQueryShortKey, StorageType.OnlyLocalStorage)

                    const q: Q = { ...initalQuery } as Q


                    //重置时state中各字段值设置为空后，即undefined，但undefined也代表没有做任何赋值动作，
                    //为了明确指定各input的value为''，需显式指定value为''。但AsynSelectInput内部维护着一个自己已选
                    //中的状态selected,虽明确告诉它value已经变了, 但并没有修改到该state
                    searchFields.filter((e) => e.type === 'asyncSelect').forEach((e) => dispatch("AsynSelectInput-reset-" + e.name))
                    setUseCache(false)
                    setSearchQuery(q)
                    setQuery(q)
                    console.log("reset to initalQuery: " + JSON.stringify(q))

                }}>重置</Link>
                
                <Button onClick={() => {
                    if (dirty) {
                        setDirty(false)

                        setUseCache(false)
                        searchQuery.lastId = undefined //修改搜索条件后，lastId重置从新开始
                        setQuery({ ...searchQuery })

                        console.log("searchQuery=" + JSON.stringify(searchQuery))

                        if (initalQueryShortKey)
                            saveItem(initalQueryShortKey, JSON.stringify(searchQuery), StorageType.OnlyLocalStorage)
                    } else{
                        f7.toast.show({text:"搜索条件未改变，无需重新搜索！换搜索条件后再试"})
                        console.log("not modify searchQuery")
                    }
                        
                }}>搜索</Button>

            </CardFooter>
        </Card>
    )
}