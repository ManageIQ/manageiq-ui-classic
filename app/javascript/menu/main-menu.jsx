import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  SideNav,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem,
} from 'carbon-components-react/es/components/UIShell';

import { MiqLogo } from './miq-logo';
import { UserOptions } from './user-options';
import { itemId, linkProps } from './item-type';


const carbonizeIcon = (classname) => (props) => (<i className={classname} {...props} />);

const mapItems = (items) => items.map((item) => (
  item.items.length
  ? <MenuSection key={item.id} {...item} />
  : <MenuItem key={item.id} {...item} />
));


const MenuItem = ({ active, href, id, title, type }) => (
  <SideNavMenuItem
    id={itemId(id)}
    isActive={active}
    {...linkProps({ type, href, id })}
  >
    {title}
  </SideNavMenuItem>
);

MenuItem.props = {
  active: PropTypes.bool,
  href: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};


const MenuSection = ({ active, id, items, title, icon }) => (
  <SideNavMenu
    id={itemId(id, true)}
    isActive={active}
    defaultExpanded={active} // autoexpand active section
    renderIcon={carbonizeIcon(icon)} // only first level sections have it, but all need the prop for consistent padding
    title={title}
  >
    {mapItems(items)}
  </SideNavMenu>
);

MenuSection.props = {
  active: PropTypes.bool,
  icon: PropTypes.string,
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  title: PropTypes.string.isRequired,
};


const MenuFind = () => (
  //TODO
  <input type="search" placeholder={__("Find")} />
);

const MenuCollapse = ({ expanded, toggle }) => (
  // TODO
  <div
    style={{
      height: '48px',
      borderTop: 'solid 1px #3d3d3d',
    }}
    onClick={toggle}
  >
    {expanded ? '<' : '>'}
  </div>
);


const initialExpanded = window.localStorage.getItem('patternfly-navigation-primary') !== 'collapsed';

export const MainMenu = (props) => {
  const { applianceName, currentGroup, currentUser, customBrand, customLogo, imagePath, menu, miqGroups } = props;
  const [expanded, setExpanded] = useState(initialExpanded);

  useEffect(() => {
    window.localStorage.setItem('patternfly-navigation-primary', expanded ? 'expanded' : 'collapsed');

    const classNames = {
      true: 'miq-main-menu-expanded',
      false: 'miq-main-menu-collapsed',
    };
    document.body.classList.remove(classNames[!expanded]);
    document.body.classList.add(classNames[expanded]);
  }, [expanded]);

  return (
    <SideNav
      aria-label={__("Main Menu")}
      isChildOfHeader={false}
      expanded={expanded}
    >
      <MiqLogo
        customBrand={customBrand}
        imagePath={imagePath}
      />
      <UserOptions
        applianceName={applianceName}
        currentUser={currentUser}
        currentGroup={currentGroup}
        miqGroups={miqGroups}
      />
      <MenuFind />

      <hr />

      <SideNavItems>
        {mapItems(menu)}
      </SideNavItems>

      <MenuCollapse
        expanded={expanded}
        toggle={() => setExpanded(!expanded)}
      />
    </SideNav>
  );
};

const propGroup = PropTypes.shape({
  description: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
});

const propUser = PropTypes.shape({
  name: PropTypes.string.isRequired,
  userid: PropTypes.string.isRequired,
});

MainMenu.propTypes = {
  applianceName: PropTypes.string.isRequired,
  currentGroup: propGroup.isRequired,
  currentUser: propUser.isRequired,
  customBrand: PropTypes.bool.isRequired,
  customLogo: PropTypes.bool.isRequired,
  imagePath: PropTypes.string.isRequired,
  menu: PropTypes.arrayOf(PropTypes.any).isRequired,
  miqGroups: PropTypes.arrayOf(propGroup).isRequired,
};
