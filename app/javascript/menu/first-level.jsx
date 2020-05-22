import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SideNavItems, SideNavLink } from 'carbon-components-react/es/components/UIShell';
import { SideNavMenuLink } from './side-nav-menu-link';
import { carbonizeIcon } from './icon';
import { itemId, linkProps } from './item-type';

const mapItems = (items, setSection) => items.map((item) => (
  item.items.length
  ? <MenuSection key={item.id} {...item} setSection={setSection} />
  : <MenuItem key={item.id} {...item} />
));


// SideNavMenuItem can't render an icon, SideNavLink can
const MenuItem = ({ active, href, icon, id, title, type }) => (
  <SideNavLink
    id={itemId(id)}
    isActive={active}
    renderIcon={carbonizeIcon(icon)}
    {...linkProps({ type, href, id })}
  >
    {title}
  </SideNavLink>
);

MenuItem.props = {
  active: PropTypes.bool,
  href: PropTypes.string.isRequired,
  icon: PropTypes.string,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};


const MenuSection = ({ active, icon, id, items, title, setSection }) => (
  <SideNavMenuLink
    id={itemId(id, true)}
    isActive={active}
    onClick={(e) => {setSection(items); e.stopPropagation();}}
    renderIcon={carbonizeIcon(icon)}
    title={title}
  />
);

MenuSection.props = {
  active: PropTypes.bool,
  icon: PropTypes.string,
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  setSection: PropTypes.func,
  title: PropTypes.string.isRequired,
};


export const FirstLevel = ({ menu, setSection }) => (
  <SideNavItems className="menu-items">
    {mapItems(menu, setSection)}
  </SideNavItems>
);
