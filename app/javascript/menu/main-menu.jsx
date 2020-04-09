import React from 'react';
import PropTypes from 'prop-types';
import {
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
} from 'carbon-components-react/es/components/UIShell';

import { itemId, linkProps } from './item-type';

const carbonizeIcon = (classname) => (props) => (<i className={classname} {...props} />);

const MenuItem = ({ active, href, id, title, type }) => (
  <SideNavMenuItem
    id={itemId(id)}
    isActive={active}
    {...linkProps({ type, href, id })}
  >
    {title}
  </SideNavMenuItem>
);

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

const mapItems = (items) => items.map((item) => (
  item.items.length
  ? <MenuSection key={item.id} {...item} />
  : <MenuItem key={item.id} {...item} />
));

const MainMenu = ({ menu }) => {
  return (
    <SideNav
      aria-label="Side navigation"
      isChildOfHeader={true}
      expanded={true}
    >
      <SideNavItems>
        {mapItems(menu)}
      </SideNavItems>
    </SideNav>
  );
};

const menuProps = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  href: PropTypes.string.isRequired,
  visible: PropTypes.bool,
  active: PropTypes.bool,
};

const recursiveMenuProps = () => ({
  ...menuProps,
  items: PropTypes.arrayOf(PropTypes.shape(menuProps)),
});

MainMenu.propTypes = {
  menu: PropTypes.arrayOf(PropTypes.shape({
    ...menuProps,
    items: PropTypes.arrayOf(PropTypes.shape({
      ...menuProps,
      items: PropTypes.arrayOf(PropTypes.shape({
        ...menuProps,
        items: PropTypes.arrayOf(PropTypes.shape(menuProps)),
      })),
    })),
  })).isRequired,
};

export default MainMenu;
