import React, { SyntheticEvent, useState } from 'react';
import { Button, f7, List, ListInput, Navbar, Page } from 'framework7-react';
import { post } from '@/request/myRequest';
import { fetchDiscachely } from '@/request/useCache';
import { hasNavBar } from '@/config';
import { WxAuthHelper } from './user/wxOAuthHelper';


export default (props: any) => {
    const [desc, setDesc] = useState<string>()
    //useEffect(()=> { document.title = "意见反馈" }, [])
    return (
        <Page noNavbar={!hasNavBar()} onPageBeforeIn={()=> document.title = "意见反馈"}>
            {hasNavBar() && <Navbar title="意见反馈" backLink="返回" />}
            <List noHairlinesMd>
                <ListInput
                    name="desc"
                    label="您的宝贵意见"
                    type="textarea"
                    placeholder="请写下您的宝贵意见，然后提交"
                    maxlength={500}
                    onChange={(e: SyntheticEvent) => setDesc((e.target as HTMLTextAreaElement).value)}
                />


                {/* <ListInput
                        name="img"
                        label="截图"
                        type="file"
                        placeholder="上传" 
                    /> */}

            </List>
            <Button large onClick={() => {
                if (!desc) {
                    f7.dialog.alert("请写下您的宝贵意见，谢谢合作")
                    return false
                }
                fetchDiscachely(() => post('/api/feedback/admin/save', { desc, uId: WxAuthHelper.getAuthBean()?.uId }),
                    (data) => {
                        console.log(data)
                        f7.toast.show({
                            text: '感谢您的宝贵意见',
                            // horizontalPosition:'center',
                            // position:'center',
                            // closeTimeout: 1500,
                            on: { close() { props.f7router.back()} },
                        })
                    }
                )
                return false
            }}>提交</Button>
        </Page>


    );
}
