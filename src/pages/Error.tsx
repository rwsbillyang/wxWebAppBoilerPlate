import React from 'react';

import { Page, Navbar, Block } from 'framework7-react';


export default (props) => (
    <Page >
        <Navbar title="出错了" backLink="返回" />
        <Block>
            {props.msg}
        </Block>
    </Page>
)


