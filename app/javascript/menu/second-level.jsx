import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { SideNavItems, SideNavMenu, SideNavMenuItem } from 'carbon-components-react/es/components/UIShell';
import { itemId, linkProps } from './item-type';

const mapItems = (items, hideSecondary, ref) => items.map((item, key) => {
  const Component = item.items.length ? MenuSection : MenuItem;

  return (
    <Component
      hideSecondary={hideSecondary}
      key={item.id}
      {...item}
      {...(ref && key === 0 && { ref })}
    />
  );
});

const MenuItem = forwardRef(({
  active, href, id, title, type, hideSecondary,
}, ref) => (
  <SideNavMenuItem
    id={itemId(id)}
    isActive={active}
    ref={ref}
    {...linkProps({
      type, href, id, hideSecondary,
    })}
  >
    {__(title)}
  </SideNavMenuItem>
));

MenuItem.propTypes = {
  active: PropTypes.bool,
  hideSecondary: PropTypes.func.isRequired,
  href: PropTypes.string,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string,
};

MenuItem.defaultProps = {
  active: false,
  href: undefined,
  type: 'default',
};

const MenuSection = forwardRef(({
  active, id, items, title, hideSecondary,
}, ref) => (
  <SideNavMenu
    id={itemId(id, true)}
    isActive={active}
    defaultExpanded={active} // autoexpand active section
    ref={ref}
    title={__(title)}
  >
    {mapItems(items, hideSecondary)}
  </SideNavMenu>
));

MenuSection.propTypes = {
  active: PropTypes.bool,
  hideSecondary: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  title: PropTypes.string.isRequired,
};

MenuSection.defaultProps = {
  active: false,
};

const SecondLevel = forwardRef(({ menu, hideSecondary }, ref) => (
  <SideNavItems>
    {mapItems(menu, hideSecondary, ref)}
  </SideNavItems>
));

SecondLevel.propTypes = {
  menu: PropTypes.any.isRequired,
  hideSecondary: PropTypes.func.isRequired,
};

export default SecondLevel;
