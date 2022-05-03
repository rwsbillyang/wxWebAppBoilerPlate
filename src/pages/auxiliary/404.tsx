import React from 'react';
import { Page, Navbar, Block } from 'framework7-react';
import { hasNavBar, TextBack } from '@/config';

 const NotFoundPage = () => (
  <Page>
    {hasNavBar() ? <Navbar title="Not found" backLink={TextBack} /> : null}
    <Block strong>
      <p>Sorry</p>
      <p>404: Requested content not found.</p>
    </Block>
  </Page>
);

export default NotFoundPage