import React from 'react';
import {
  Block,
  Navbar,
  Page,
} from 'framework7-react';




import { hasNavBar } from '@/config';


/**
 * dataStats的页面内容，有两个按钮进行切换列表
 * 按访客： 最新看我，看我最多
 * 按素材： 最新访客，最多访客，最新分享，最多分享
 */
export default () => {
  return (
    <Page  >
      {hasNavBar() && <Navbar title="Tab2" sliding={false} />}
        <Block>
          <p className="text-align-center">content of tab2 </p>
        </Block>
    </Page>
  );
}

