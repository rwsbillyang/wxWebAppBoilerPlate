import { CODE, DataBox, getDataFromBox } from "@/request/databox"
import { get } from "@/request/myRequest"
import { getItem, saveItem, StorageType } from "@/request/useCache"
import { ListInput } from "framework7-react"
import React, { SyntheticEvent, useEffect, useState } from "react"
import useBus from "use-bus"
import { SelectOption } from "./f7ListKit/data"
import { FieldMeta } from "./f7ListKit/MyF7Props"


export interface MyAsyncSelectProps {
    key: string //缓存键
    url: string, //请求url
    query?: object | string | any[], //请求参数
    convertFunc: (item: any) => SelectOption //将请求结果转换为select option
}


// export const AsynSelectInput: React.FC<{
//     onSelectChange: (option: SelectOption) => void, props: FieldMeta<>, asyncProps?: MyAsyncSelectProps
// }> = ({ onChange, key, label, defaultValue, asyncProps }) => {
/***
 * 由react管理state的受控组件，使用value将其值传递进来；若重置空值，则使用OptionEmptyValue
 * 
 * AsynSelectInput设置选项过程：
 * Step1 接收到的value值，有三种情形：1. 初始状态的空值 2. 修改旧数据时传递过来的非空值 3. 重置后接收到的空值 
 * Step2 内部加载options选项数据完毕后，根据前三种情形重新指定
 * 
 * 对于编辑某一个实例来说，无需父组件二次修改selected状态；但对搜索重置来说，一旦指定了选项，如何从外部（父组件）修改其内部维护的selected状态呢？
 *  方案：采用useBus发送消息
 */
export function AsynSelectInput<T>(props: FieldMeta<T>, onValueChange: (newValue?: string|number) => void, 
asyncProps?: MyAsyncSelectProps){
    const OptionEmptyValue = "null" //如果设置为""空值，onChange得到是label如"请选择"而不是空

    const emptyOption: SelectOption = { label: "请选择", value: OptionEmptyValue } 
    const loadingOption: SelectOption = { label: "加载中", value: OptionEmptyValue }
    const [options, setOptions] = useState([loadingOption])
    const [selected, setSelected] = useState(props.value || OptionEmptyValue) //AsynSelectInput内部维护的选项值，还有可能外部重新指定了该值（如搜索重置）
    

    //console.log("AsynSelectInput: selected="+selected)
    
    useBus('AsynSelectInput-reset-' + props.name, () => setSelected(OptionEmptyValue), [selected])
    
    useEffect(() => {
        if (asyncProps) fetchCachely(asyncProps)
    }, [])

    const fetchCachely = (asyncProps: MyAsyncSelectProps) => {
        const { key, url, query, convertFunc } = asyncProps
        const storageType = StorageType.OnlySessionStorage
        const fetchData = (query?: object | string | any[]) => {
            //setIsLoading(true)
            get(url, query)
                .then(res => {
                    //setIsLoading(false)
                    const box: DataBox<any> = res.data
                    if (box.code === CODE.OK) {
                        const data = getDataFromBox(box)
                        if (data) {
                            saveItem(key, JSON.stringify(data), storageType)
                            setOptions([emptyOption].concat(data.map((e) => convertFunc(e))))
                            setSelected(selected)
                        } else {
                            console.log("no data from url=" + url)
                            setOptions([emptyOption])
                        }
                    } else {
                        console.log("fail load from url=" + url + ", box.code=" + box.code)
                        setOptions([emptyOption])
                    }
                })
                .catch(err => {
                    console.log("fail to load options from url=" + url)
                    //setIsLoading(false)
                    setOptions([emptyOption])
                })
        }

        //明确指定使用cache且不是在搜索
        const v = getItem(key, storageType)
        if (v) {
            setOptions([emptyOption].concat(JSON.parse(v).map((e) => convertFunc(e))))
            setSelected(selected)
        } else {
            fetchData(query)
        }
    }

    return (
        <ListInput
            {...props}
            type="select"
            //defaultValue={selected}
            value={selected}
            onChange={(event: SyntheticEvent) => {
                const target = event.target as HTMLInputElement
                const newValue = target.value
                //如果设置option的值为空字符串，将得到label作为它的值；
                //方案1：为了让onValidate校验失败，应将OptionNullValue设置为不符合pattern，否则OptionNullValue依然被校验成功。方案失败：似乎没按pattern进行校验，onValidate总是校验成功
                //方案2：去掉属性中的valiate和pattern，不让F7进行校验；只要存在required，则自行设置校验结果
                if (newValue === OptionEmptyValue) 
                    onValueChange(undefined)//OptionEmptyValue为空值
                else
                    onValueChange(newValue)

                setSelected(newValue)
            }}
        >
            {options?.map((option: SelectOption, i: number) => <option key={i} value={option.value || option.label}>{option.label}</option>)}
        </ListInput>
    )
}
