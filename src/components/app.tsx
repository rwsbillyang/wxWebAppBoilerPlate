import React, { useEffect } from 'react';
import {
  App,
  f7ready,
  View,
} from 'framework7-react';


import routes from '../js/routes';
import { AppName, BrowserHistorySeparator, TextCancel, TextOK } from '@/config';
import { beforeLeave } from '@/js/routesHelper';
import { Framework7Parameters } from 'framework7/types';




  // Framework7 Parameters
  const f7params: Framework7Parameters = {
    name: AppName, // App name
  autoDarkTheme: true,
  theme: 'ios', // auto Automatic theme detection
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
  lazy: {
    threshold: 0,
    sequential: true,
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

const MyApp = () => {
  //useWxJsSdk()

  useEffect(() => {
    f7ready((f7) => {
      f7.data = {} //存放wxjsSDK初始化状态，以及编辑状态
      console.log("f7ready!")
      // const ua = window.navigator.userAgent;
      // if(/Android/i.test(ua) && /ColorScheme\/Dark/i.test(ua)){
      //   console.log("enable DarkTheme!")
      //   f7.darkTheme = true
      // }

      // for(let i = 0; i < routes.length; i++){
      //   console.log(`routes[${i}]: ${routes[i].name}, ${routes[i].path}`)
      // }
    })
  }, []);

  return (
    <App { ...f7params } >

        {/* Your main view, should have "view-main" class */}
        <View main className="safe-areas" url="/"  stackPages browserHistory browserHistorySeparator={BrowserHistorySeparator}/>

    </App>
  );
}
export default MyApp;
