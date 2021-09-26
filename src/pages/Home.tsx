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
} from 'framework7-react';
import { AppName, hasNavBar } from '@/config';

const HomePage = () => (
  <Page name="home">

    {hasNavBar() ? <Navbar title={AppName}>
      <NavRight><Link iconOnly iconF7="gear_alt" popoverOpen=".popover-menu"></Link></NavRight>
    </Navbar> : null}

    <Toolbar bottom>
      <Link href="/admin/demo/wxwork?corpId=wwb096af219dea3f1c&agentId=1000003">wxAdmin</Link>
      <Link>Right Link</Link>
    </Toolbar>

    <Block strong>
      <p>Here is your blank Framework7 app. Let's see what we have here.</p>
    </Block>
    <Popover className="popover-menu">
      <List>
        <ListItem link="/about" popoverClose title="About" />
        <ListItem link="/error" popoverClose title="Error" routeProps={ {msg:"something wrong"} }/>
        <ListItem link="/404" popoverClose title="404" />
      </List>
    </Popover>
  </Page>
);
export default HomePage;