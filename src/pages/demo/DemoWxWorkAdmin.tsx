import React from 'react';
import { Page, Navbar, Block, BlockTitle } from 'framework7-react';
import { AppName, hasNavBar, TextBack, Version } from '@/config';
import { WxAuthHelper } from '../../user/WxOauthHelper';




export default () => {
    return (
      <Page name="wxWorkAdmin" onPageInit={() => console.log("onPageInit : to request data from remote server") }>
        {hasNavBar() ? <Navbar title="wxWorkAdmin" backLink={TextBack} /> : null}
        <BlockTitle className="text-align-center">{AppName+" " + Version} </BlockTitle>
       
       
        <Block>
          <p>Login info: {JSON.stringify(WxAuthHelper.getAuthBean())}</p>
        </Block>
  

      </Page>
    );
  }