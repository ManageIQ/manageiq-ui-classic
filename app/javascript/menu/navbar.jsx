import React from 'react';
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderMenuButton,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
} from 'carbon-components-react/es/components/UIShell';

import { MainMenu } from './main-menu';
import NotificationDrawer from '../components/notification-drawer/notification-drawer';
import ToastList from '../components/toast-list/toast-list';
import navbar from '../components/top-navbar';

export const Navbar = (props) => {
  const { customBrand, imagePath } = props;
  const { rightSection } = props;
  const { notificationDrawer, toastList } = props;
  const { menu } = props;

  return (
    <HeaderContainer render={() => (
      <Header aria-label="Carbon Tutorial">
        <SkipToContent />

        <HeaderMenuButton
          aria-label="Open menu"
          isActive={true}
        />

        <HeaderName href="#" prefix="IBM">
          ManageIQ
        </HeaderName>

        { menu && (<MainMenu menu={menu} />) }

        <navbar.NavbarHeader customBrand={customBrand} imagePath={imagePath} />
        // %nav.collapse.navbar-collapse
        { rightSection && (<navbar.RightSection {...rightSection} />) }

        <HeaderNavigation aria-label="Carbon Tutorial">
          <HeaderMenuItem href="/repos">Repositories</HeaderMenuItem>
        </HeaderNavigation>

        { notificationDrawer && (<NotificationDrawer />) }
        { toastList && (<ToastList />) }

        <HeaderGlobalBar />
      </Header>
    )} />
  );
};
