import React, {  useState } from 'react';
import { Page, Tabs, Tab, Link, Toolbar } from 'framework7-react';
import { hasNavBar } from '@/config';


export const TabInfos = [
  { path: "/admin/tab/tab1", id: "tab1", text: "tab1", icon: "f7:house" },
  { path: "/admin/tab/tab2", id: "tab2", text: "tab2", icon: "f7:graph_circle" },
  { path: "/admin/tab/tab3", id: "tab3", text: "tab3", icon: "f7:person_2" },
  { path: "/admin/tab/tab4", id: "tab4", text: "tab4", icon: "f7:person" }
]

export const currentIndex = (path: string) => {
  for (let i = 0; i < TabInfos.length; i++) {
    if (TabInfos[i].path === path) {
      return i
    }
  }
  return 0
}


export default (props: any) => {
  const [current, setCurrent] = useState(currentIndex(props.f7route.path))

  return (
    <Page name="home" noNavbar={!hasNavBar()} tabs pageContent={false} hideNavbarOnScroll 
    onPageAfterIn={()=>document.title=TabInfos[current].text }>

      <Toolbar bottom tabbar labels>
        {TabInfos.map((e, index) => <Link key={index} tabLink tabLinkActive={index === current}
          href={e.path} routeTabId={e.id} text={e.text} iconIos={e.icon} iconAurora={e.icon} iconMd={e.icon}></Link>)}
      </Toolbar>

      <Tabs routable>
        {TabInfos.map((e, index) =>
          <Tab key={index}
            id={e.id}
            onTabShow={() => { setCurrent(index);document.title=TabInfos[index].text }}
            tabActive={index === current}
          ></Tab>)}
      </Tabs>
    </Page>
  )
}

