import React, { useState } from 'react';
import {
    f7,
    Page,
    LoginScreenTitle,
    List,
    ListInput,
    ListButton,
    BlockFooter,
} from 'framework7-react';
import { postWithouAuth } from '@/request/myRequest';
import { AuthBean, LoginParam } from '@/user/AuthData';
import { CODE, DataBox, getDataFromBox } from '@/request/databox';
import { WxAuthHelper } from '@/user/WxOauthHelper';
import { StorageType } from '@/request/useCache';

const UserPwdLoginPage: React.FC<LoginParam> = (props: LoginParam) => {
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const signIn = () => {
        // f7.dialog.alert(`Username: ${username}<br>Password: ${password}`, () => {
        //     f7router.back();
        // });

        if(!username || !password)
        {
            f7.dialog.alert("请输入用户名和密码") 
            return
        }
        f7.dialog.preloader()
        postWithouAuth(`/api/u/login`, {name: username, pwd: password})
        .then(function (res) {
            f7.dialog.close()
            const box: DataBox<AuthBean> = res.data
            if (box.code === CODE.OK) 
            {
                const authBean = getDataFromBox(box)
                if(authBean){
                    const authStorageType = props.authStorageType || StorageType.BothStorage
                    WxAuthHelper.onAuthenticated(authBean, authStorageType)
                    const from = props.from // /wx/webAdmin/login?from=/wx/super/admin/home
                    if(from){
                        f7.toast.show({text:"登录成功，正在跳转..."})
                        console.log("jump to from="+from)
                        //f7.views.main.router.navigate(from)  //window.location.href = from 
                        window.location.href = from //navigate跳不过去，改用此行
                    }else
                        f7.dialog.alert("登录成功，请自行打开管理页面")
                }else{
                    f7.dialog.alert("异常：未获取到登录信息")
                }
            }else
                f7.dialog.alert(box.msg||'出错了')
        }).catch(function (err) {
            f7.dialog.close()
            f7.dialog.alert(err.status + ": " + err.message)
            console.log(err.status + ": " + err.message)
        })
    };

    

    return (
        <Page noToolbar noNavbar noSwipeback loginScreen>
            <LoginScreenTitle>用户登录</LoginScreenTitle>
            <List form>
                <ListInput
                    label="用户名"
                    type="text"
                    placeholder="Your username"
                    value={username || ''}
                    onInput={(e) => {
                        setUsername(e.target.value);
                    }}
                />
                <ListInput
                    label="密码"
                    type="password"
                    placeholder="Your password"
                    value={password|| ''}
                    onInput={(e) => {
                        setPassword(e.target.value);
                    }}
                />
            </List>
            <List>
                <ListButton onClick={signIn}>登录</ListButton>
                <BlockFooter>
                    @版权所有 2021 
                    <br />
                   @CopyRight 2021
                </BlockFooter>
            </List>
        </Page>
    );
};

export default UserPwdLoginPage