import React from 'react';
import {
  Page,
  Navbar,
  Link,
  Toolbar,
  Block,
  NavRight,
  Popover,
  List,
  ListItem,
  f7,
} from 'framework7-react';
import { hasNavBar } from '@/config';
import { evictAllCaches, StorageType } from '@/request/useCache';
import { WxAuthHelper } from '../user/WxOauthHelper';


const HomePage = () => (
  <Page name="home">

    {hasNavBar() ? <Navbar title="首页">
      <NavRight><Link iconOnly iconF7="gear_alt" popoverOpen=".popover-menu"></Link></NavRight>
    </Navbar> : null}

   <Block>
     Wechat project
   </Block>

    <Toolbar bottom>
      <Link href="/n/list">news</Link>
      <Link iconOnly iconF7="gear_alt" popoverOpen=".popover-menu"></Link>
    </Toolbar>

    <Popover className="popover-menu">
      <List>
        <ListItem link="/about" popoverClose title="About" />
        <ListItem link="/error" popoverClose title="Error" routeProps={ {msg:"something wrong"} }/>
        <ListItem link="/404" popoverClose title="404" />
        <ListItem link={`/contactKf`} popoverClose title="联系客服" />
        <ListItem link="https://t.asczwa.com/taobao?backurl=https://m.tb.cn/h.f7evsb3?sm=b4f49e" popoverClose external title="测试打开淘宝" />
       
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

                    }} title="退出登录" />
      </List>
    </Popover>
  </Page>
);
export default HomePage;
