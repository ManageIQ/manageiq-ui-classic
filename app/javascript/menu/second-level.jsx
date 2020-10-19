import React from 'react';
import PropTypes from 'prop-types';
import { SideNavItems, SideNavMenu, SideNavMenuItem } from 'carbon-components-react/es/components/UIShell';
import { itemId, linkProps } from './item-type';

const mapItems = (items, hideSecondary) => items.map((item) => {
  const Component = item.items.length ? MenuSection : MenuItem;

  return <Component hideSecondary={hideSecondary} key={item.id} {...item} />;
});


const MenuItem = ({
  active, href, id, title, type, hideSecondary,
}) => (
  <SideNavMenuItem
    id={itemId(id)}
    isActive={active}
    {...linkProps({
      type, href, id, hideSecondary,
    })}
  >
    {__(title)}
  </SideNavMenuItem>
);

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


const MenuSection = ({
  active, id, items, title, hideSecondary,
}) => (
  <SideNavMenu
    id={itemId(id, true)}
    isActive={active}
    defaultExpanded={active} // autoexpand active section
    title={__(title)}
  >
    {mapItems(items, hideSecondary)}
  </SideNavMenu>
);

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

const SecondLevel = ({ menu, hideSecondary }) => (
  <SideNavItems>
    {mapItems(menu, hideSecondary)}
  </SideNavItems>
);

SecondLevel.propTypes = {
  menu: PropTypes.any.isRequired,
  hideSecondary: PropTypes.func.isRequired,
};

export default SecondLevel;
