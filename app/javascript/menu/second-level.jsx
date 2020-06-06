import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SideNavItems, SideNavMenu, SideNavMenuItem } from 'carbon-components-react/es/components/UIShell';
import { itemId, linkProps } from './item-type';

const mapItems = (items, hideSecondary) => items.map((item) => {
  let Component = item.items.length ? MenuSection : MenuItem;

  return <Component
    hideSecondary={hideSecondary}
    key={item.id}
    {...item}
  />
});


const MenuItem = ({ active, href, id, title, type, hideSecondary }) => (
  <SideNavMenuItem
    id={itemId(id)}
    isActive={active}
    {...linkProps({ type, href, id, hideSecondary })}
  >
    {title}
  </SideNavMenuItem>
);

MenuItem.props = {
  active: PropTypes.bool,
  hideSecondary: PropTypes.func,
  href: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};


const MenuSection = ({ active, id, items, title, hideSecondary }) => (
  <SideNavMenu
    id={itemId(id, true)}
    isActive={active}
    defaultExpanded={active} // autoexpand active section
    title={title}
  >
    {mapItems(items, hideSecondary)}
  </SideNavMenu>
);

MenuSection.props = {
  active: PropTypes.bool,
  hideSecondary: PropTypes.func,
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  title: PropTypes.string.isRequired,
};


export const SecondLevel = ({ menu, hideSecondary }) => (
  <SideNavItems>
    {mapItems(menu, hideSecondary)}
  </SideNavItems>
);
