
import { AppKeyPrefix } from "@/config"
import { evictCache, saveItem } from "@/request/useCache"
import { Link, NavRight, Searchbar } from "framework7-react"
import React, { ChangeEvent } from "react"


export const searchKey = AppKeyPrefix + "/search/word"

export const MySearchbar: React.FC<{ placeHolder?: string }> = (props) => {
    //const [keyword, setKeyword] = useState<string>()//使用state中的keyword总为空,改用session

    return (
        <>
            <NavRight>
                <Link
                    searchbarEnable="#mysearchbar"
                    iconIos="f7:search"
                    iconAurora="f7:search"
                    iconMd="material:search"></Link>
            </NavRight>
            <Searchbar
                id="mysearchbar"
                expandable
                disableButtonText="取消"
                placeholder={props.placeHolder || "搜索"}
                customSearch={true}
                hideDividers={false}
                noHairline={true}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    // let target = e.target as HTMLInputElement;
                    const v = e.currentTarget.value
                    //console.log("onChange, value=" + v)
                    //setKeyword(v)
                    saveItem(searchKey, v)
                }}
                onClickClear={()=>evictCache(searchKey)}
                onSearchbarDisable={()=>evictCache(searchKey)}
                >
            </Searchbar>
        </>
    )
}

//search bar 在取消搜索时，发送模拟按键事件ESC，列表中监听按键，取消后恢复原列表
const sendClearEvent = () => {
    // 创建事件 https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/KeyboardEvent
    //https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/key
    var KeyboardEventInit = {key:"Escape", code:"", location:0, repeat:false, isComposing:false}
    const event = new KeyboardEvent("keyup", KeyboardEventInit);

    document.dispatchEvent(event)
}


export const MySearchbar2: React.FC<{placeHolder?: string }> = (props) => {
    
    return (
        <Searchbar
        id="mysearchbar2"
        disableButtonText="取消"
        placeholder={props.placeHolder || "搜索"}
        customSearch={true}
        hideDividers={false}
        noHairline={true}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
            // let target = e.target as HTMLInputElement;
            const v = e.currentTarget.value
            //console.log("onChange, value=" + v)
            //setKeyword(v)
            saveItem(searchKey, v)
           
        }}
        onClickClear={()=>evictCache(searchKey)}
        onSearchbarDisable={()=>{
            evictCache(searchKey)
            sendClearEvent()
        }}
        >
    </Searchbar>
    )
}
