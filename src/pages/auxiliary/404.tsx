import React from 'react';
import { Page, Navbar, Block } from 'framework7-react';

 const NotFoundPage = () => (
  <Page>
    <Navbar title="Not found" backLink="返回" />
    <Block strong>
      <p>Sorry</p>
      <p>404: Requested content not found.</p>
    </Block>
  </Page>
);

export default NotFoundPage