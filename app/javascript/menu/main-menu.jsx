import React from 'react';
import PropTypes from 'prop-types';
import {
  SideNav,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem,
} from 'carbon-components-react/es/components/UIShell';

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


export const MainMenu = ({ menu }) => {
  return (
    <SideNav
      aria-label={__("Main Menu")}
      isChildOfHeader={true}
      expanded={true}
    >
      <SideNavItems>
        {mapItems(menu)}
      </SideNavItems>
    </SideNav>
  );
};

MainMenu.propTypes = {
  menu: PropTypes.arrayOf(PropTypes.any).isRequired,
};
