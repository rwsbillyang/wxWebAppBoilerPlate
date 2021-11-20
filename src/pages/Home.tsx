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
import { AppName, hasNavBar } from '@/config';
import { evictAllCaches, StorageType } from '@/request/useCache';
import { WxAuthHelper } from '../user/WxOauthHelper';


const HomePage = () => (
  <Page name="home">

    {hasNavBar() ? <Navbar title={AppName}>
      <NavRight><Link iconOnly iconF7="gear_alt" popoverOpen=".popover-menu"></Link></NavRight>
    </Navbar> : null}

    <Toolbar bottom>
      <Link href="/admin/demo/wxwork?corpId=wwb096af219dea3f1c&agentId=1000003">wxAdmin</Link>
      <Link href="/admin/tab/tab1?corpId=wwb096af219dea3f1c&agentId=1000003">tabPages</Link>
    </Toolbar>

    <Block strong>
      <p>Here is your blank Framework7 app. Let's see what we have here.</p>
    </Block>
    <Popover className="popover-menu">
      <List>
        <ListItem link="/about" popoverClose title="About" />
        <ListItem link="/error" popoverClose title="Error" routeProps={ {msg:"something wrong"} }/>
        <ListItem link="/404" popoverClose title="404" />
        <ListItem link={`/contactKf`} popoverClose title="联系客服" />
                <ListItem link={`/admin/feedback`} popoverClose title="意见反馈" />
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