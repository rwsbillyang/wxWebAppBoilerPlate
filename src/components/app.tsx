import React from 'react';

import {
  f7ready,
  App,
  View,
} from 'framework7-react';


import routes from '../js/routes';
import { AppName, BrowserHistorySeparator, TextCancel, TextOK } from '@/config';
import { beforeLeave } from '@/js/routesHelper';
import { Framework7Parameters } from 'framework7/types';

const MyApp = () => {


  // Framework7 Parameters
  const f7params: Framework7Parameters = {
    name: AppName, // App name
      theme: 'auto', // Automatic theme detection
      dialog: {//https://framework7.io/docs/dialog.html#confirm
        title: AppName, // set default title for all dialog shortcuts
        buttonOk: TextOK, // change default "OK" button text
        buttonCancel: TextCancel,
      },
      toast: {
        closeTimeout: 1500,
        closeButton: false,
        position: 'center',
        horizontalPosition: 'center'
      },
      // navbar: {
      //   mdCenterTitle: true,
      //   hideOnPageScroll: true
      // },
      view: {
        routesBeforeLeave: beforeLeave
      },
      touch: {
        mdTouchRipple: false,
      },
      popover: {
        closeByBackdropClick: true,
        closeByOutsideClick: true,
       // closeOnEscape: true
      },
      // App routes
      routes: routes,
  };

  f7ready(() => {


    // Call F7 APIs here
  });

  return (
    <App { ...f7params } >

        {/* Your main view, should have "view-main" class */}
        <View main className="safe-areas" url="/"  stackPages browserHistory browserHistorySeparator={BrowserHistorySeparator}/>

    </App>
  );
}
export default MyApp;
