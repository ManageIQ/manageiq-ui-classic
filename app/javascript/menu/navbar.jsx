import React from 'react';
import PropTypes from 'prop-types';
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
import navbar from '../components/top-navbar';

export const Navbar = (props) => {
  const { customBrand, imagePath } = props;
  const { rightSection } = props;
  const { menu } = props;

  return (
    <HeaderContainer render={() => (
      <Header aria-label="Carbon Tutorial">
        {/* screenreader link to #main-content */}
        <SkipToContent />

        {/* mobile, FIXME: use the render params HeaderContainer gives, pass to MainMenu */}
        <HeaderMenuButton
          aria-label={__("Toggle navigation")}
          isActive={true}
        />

        {/* FIXME navbar.NavbarHeader */}
        <HeaderName
          href="/dashboard/start_url"
          prefix="IBM"
          title={__('Go to my start page')}
        >
          <img
            alt="ManageIQ"
            className="navbar-brand-name"
            src={customBrand ? '/upload/custom_brand.png' : imagePath}
          />
        </HeaderName>

        { menu && (<MainMenu menu={menu} />) }

        {/* TODO...
        <HeaderNavigation aria-label="Carbon Tutorial">
          <HeaderMenuItem href="/repos">Repositories</HeaderMenuItem>
        </HeaderNavigation>
        */}

        <HeaderGlobalBar />

        {/* %nav.collapse.navbar-collapse */}
        { rightSection && (<navbar.RightSection {...rightSection} />) }
      </Header>
    )} />
  );
};

Navbar.propTypes = {
  customBrand: PropTypes.bool.isRequired,
  imagePath: PropTypes.string.isRequired,
  //FIXME: the rest
};
