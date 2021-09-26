import { Navbar, Page } from 'framework7-react';
import React, { CSSProperties } from 'react';
import { hasNavBar } from '@/config';


const pageCenter2: CSSProperties = { left: "50%", top: '50%', position: "absolute", transform: "translate(-50%,-50%)" }
export default () => {
    return (
        <Page noNavbar={!hasNavBar()} onPageBeforeIn={()=> document.title = "添加客服"}>
            {hasNavBar() && <Navbar title="添加客服" backLink="返回" />}
            <img width={250} height={250} style={pageCenter2} src="https://wework.qpic.cn/wwpic/458163_plGzqI0jS1OXcGz_1631168504/0" />
        </Page>
    )
}