import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SideNavItems, SideNavMenu, SideNavMenuItem } from 'carbon-components-react/es/components/UIShell';
import { itemId, linkProps } from './item-type';

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


const MenuSection = ({ active, id, items, title }) => (
  <SideNavMenu
    id={itemId(id, true)}
    isActive={active}
    defaultExpanded={active} // autoexpand active section
    title={title}
  >
    {mapItems(items)}
  </SideNavMenu>
);

MenuSection.props = {
  active: PropTypes.bool,
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  title: PropTypes.string.isRequired,
};


export const SecondLevel = ({ menu }) => (
  <SideNavItems>
    {mapItems(menu)}
  </SideNavItems>
);
