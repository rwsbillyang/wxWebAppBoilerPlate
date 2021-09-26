import React from 'react';
import {
  Icon, List, ListItem, Navbar, Page
} from 'framework7-react';

import { hasNavBar } from '@/config';





export default () => {

  return (
    <Page noNavbar={!hasNavBar()}>
      {hasNavBar() && <Navbar title="Tab4" />}

      <List >
        <ListItem link="">
          <img slot="media" width="80" height="80" style={{ borderRadius: "0.5em" }} />
          <div slot="title">nickname<br />
            <span style={{ fontSize: "12px", color: "gray" }}>
              <br />some info</span> </div>
          <div slot="after" style={{ fontSize: "16px", color: "#007aff" }}>修改</div>
        </ListItem>
      
        
        <li className="item-divider" style={{ "height": "32px" }}></li>

        <ListItem title="个性开关">
          <Icon slot="media" f7="gear_alt" size={20} color="blue"></Icon>
        </ListItem>

        <li className="item-divider" style={{ "height": "18px" }}></li>

        <ListItem link="/contactKf" title="专属客服" >
          <Icon slot="media" f7="headphones" size={20} color="orange"></Icon>
        </ListItem>

        <ListItem link="/admin/feedback" title="意见反馈" >
          <Icon slot="media" f7="pencil_ellipsis_rectangle" size={20} color="blue"></Icon>
        </ListItem>

         
      </List>
    </Page>
  );
}



