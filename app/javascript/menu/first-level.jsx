import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { SideNavItems, SideNavLink } from 'carbon-components-react/es/components/UIShell';
import SideNavMenuLink from './side-nav-menu-link';
import { carbonizeIcon } from './icon';
import { itemId, linkProps } from './item-type';

const mapItems = (items, expanded, { activeSection, onSelect, ref: { prevRef, nextRef } }) => items.map((item, itemPosition) => {
  const prev = items[itemPosition - 1]; // Retrieve the previous item in the menu

  // Set the reference to the previous/next item relatively to the selected one
  const ref = (item.id === activeSection && prevRef)
           || (prev && prev.id === activeSection && nextRef)
           || undefined;

  const props = {
    key: item.id,
    ref,
    ...item,
  };

  return (
    item.items.length ? (
      <MenuSection
        {...props}
        hover={item.id === activeSection}
        onSelect={onSelect}
        expanded={expanded}
        itemPosition={itemPosition}
      />
    ) : (
      <MenuItem {...props} />
    )
  );
});

// SideNavMenuItem can't render an icon, SideNavLink can
const MenuItem = forwardRef(({
  active, href, icon, id, title, type,
}, ref) => (
  <SideNavLink id={itemId(id)} isActive={active} ref={ref} renderIcon={carbonizeIcon(icon)} {...linkProps({ type, href, id })}>
    {__(title)}
  </SideNavLink>
));

MenuItem.propTypes = {
  active: PropTypes.bool,
  href: PropTypes.string,
  icon: PropTypes.string.isRequired,
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
  active, expanded, hover, icon, id, items, title, onSelect, itemPosition,
}, ref) => (
  <SideNavMenuLink
    expanded={expanded}
    id={itemId(id, true)}
    isActive={active}
    forceHover={hover}
    onClick={(e) => {
      onSelect({ id, items });
      e.stopPropagation();
    }}
    ref={ref}
    renderIcon={carbonizeIcon(icon)}
    title={__(title)}
    itemPosition={itemPosition}
  />
));

MenuSection.propTypes = {
  active: PropTypes.bool,
  expanded: PropTypes.bool.isRequired,
  hover: PropTypes.bool,
  icon: PropTypes.string,
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  onSelect: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  itemPosition: PropTypes.number.isRequired,
};

MenuSection.defaultProps = {
  active: false,
  hover: false,
  icon: undefined,
};

const FirstLevel = forwardRef(({
  activeSection, expanded, menu, onSelect,
}, ref) => (
  <SideNavItems className="menu-items">
    {mapItems(menu, expanded, { onSelect, activeSection, ref })}
  </SideNavItems>
));

FirstLevel.propTypes = {
  activeSection: PropTypes.string,
  expanded: PropTypes.bool.isRequired,
  menu: PropTypes.arrayOf(PropTypes.any).isRequired,
  onSelect: PropTypes.func.isRequired,
};

FirstLevel.defaultProps = {
  activeSection: undefined,
};

export default FirstLevel;
