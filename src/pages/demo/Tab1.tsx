import React from 'react';
import {
  Navbar,
  Page,

} from 'framework7-react';


import { hasNavBar } from '@/config';


export default () => {
  return (
    <Page hideNavbarOnScroll noNavbar={!hasNavBar()}>
      {hasNavBar() ? <Navbar title="Tab1" sliding={false} /> : null}
      <p className="text-align-center"> content of tab1  </p>
    </Page>
  );
}
