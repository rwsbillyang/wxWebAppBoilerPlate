import { post } from "@/request/myRequest"
import { evictAllCaches, fetchDiscachely, StorageType } from "@/request/useCache"
import { WxAuthHelper } from "@/user/WxOauthHelper"
import { f7, Icon, List, ListItem, Popover, Toggle } from "framework7-react"
import React, { useState } from "react"

export const PopoverDefaultSettings = () => {
    const vconsoleKey = "vconsoleEnabled"
    const [vconsoleEnabled, setVconsoleEnabled] = useState(localStorage.getItem(vconsoleKey) === '1')

    return <Popover id="popover-menu-default-settings">
        <List>
            <ListItem link popoverClose onClick={() => {
                f7.dialog.prompt('售后老师请填写“某老师”，运营填大家熟知的名字或外号', "修改昵称", (value) => {
                    fetchDiscachely<number>(() => post("/api/wx/work/account/admin/updateNick?nick=" + value),
                        (data) => {
                            f7.data.nick = value
                        })
                }, () => { }, f7.data.nick || WxAuthHelper.getAuthBean()?.nick)

            }} title="修改昵称" > <Icon slot="media" f7="person_alt" size={20} color="teal"></Icon></ListItem>

            
            <ListItem link popoverClose onClick={() => {
                WxAuthHelper.onSignout()
                evictAllCaches(StorageType.OnlyLocalStorage)
                f7.toast.show({
                    text: "即将退出...",
                    on: {
                        close: function () {
                            wx.closeWindow();
                        },
                    }
                })

            }} title="退出登录" > <Icon slot="media" f7="power" size={20} color="yellow"></Icon></ListItem>

{
                WxAuthHelper.hasRole("dev") ? <ListItem>
                    <Icon slot="media" f7="ant" size={20} color="gray"></Icon>
                    <span>vconsole</span>
                    <Toggle checked={vconsoleEnabled}
                        onToggleChange={(v: boolean) => {
                            setVconsoleEnabled(v)
                            localStorage.setItem(vconsoleKey, v ? "1" : "0")
                            f7.toast.show({ text: "关闭窗口后，重新打开生效" })
                        }} ></Toggle>
                </ListItem> : null
            }
        </List>
    </Popover>

}