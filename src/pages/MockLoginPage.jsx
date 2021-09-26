import React from 'react';
import {
  Page,
  Navbar,
  Link,
  Block,
} from 'framework7-react';

const MockLoginPage = (props) => (
  <Page name="home">
    <Navbar title="loginPage"> </Navbar>
    <Block strong>
      <p>Here is login page: first login then jump back to <Link href={props.from}>{props.from}</Link></p>
    </Block>

  </Page>
);
export default MockLoginPage;