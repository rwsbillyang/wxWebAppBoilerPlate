import React from 'react';
import { Page, Navbar, Block, BlockTitle, f7 } from 'framework7-react';
import { AppName, Version } from '@/config';



export default () => {

  return (
    <Page name="about" onPageInit={() => console.log("onPageInit currentRoute=" + JSON.stringify(f7.views.main.router.currentRoute))}>
      <Navbar title="About" backLink="back" />
      <BlockTitle className="text-align-center">{AppName+" " + Version} </BlockTitle>
      <Block>
        <p>Webapp boilerplate code for Wechat environment, written in typescript based on Framework7 react, support OAuth2 login</p>
      </Block>

      <BlockTitle className="text-align-center">Contact me: </BlockTitle>
      <Block className="text-align-center">
        <img src="https://wework.qpic.cn/wwpic/458163_plGzqI0jS1OXcGz_1631168504/0" width="50%"/> 
      </Block>

    </Page>
  );
}
