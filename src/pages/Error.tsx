import React from 'react';

import { Page, Navbar, Block } from 'framework7-react';
import { hasNavBar, TextBack } from '@/config';


const ErrorPage = (props) => (
    <Page >
        <Navbar title="出错了" backLink="返回" />
        {hasNavBar() ? <Navbar title="出错了" backLink={TextBack} /> : null}
        <Block>
            {props.msg}
        </Block>
    </Page>
)


export default ErrorPage
