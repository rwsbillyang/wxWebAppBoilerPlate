import { Navbar, Page } from 'framework7-react';
import React from 'react';
import { hasNavBar } from '@/config';
import { pageCenter2 } from '@/components/style';



export default () => {
    return (
        <Page noNavbar={!hasNavBar()} onPageBeforeIn={()=> document.title = "技术支持"}>
            {hasNavBar() && <Navbar title="技术支持" backLink="返回" />}
            <img width={250} height={250} style={pageCenter2} src="https://wework.qpic.cn/wwpic/458163_plGzqI0jS1OXcGz_1631168504/0" />
        </Page>
    )
}