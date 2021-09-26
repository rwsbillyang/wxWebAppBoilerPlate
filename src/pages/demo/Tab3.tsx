import React  from 'react';
import {  Page, Navbar, Block } from 'framework7-react';


import {  hasNavBar } from '@/config';

export default () => {
  return (
    <Page  onPageAfterIn={()=> document.title = "Tab3"}>
      {hasNavBar() ? <Navbar title="Tab3" sliding={false}/> : null}

      <Block>
          <p className="text-align-center">content of tab3 </p>
        </Block>
    </Page>
  )
}


