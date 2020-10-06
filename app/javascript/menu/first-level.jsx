import React from 'react';
import PropTypes from 'prop-types';
import { SideNavItems, SideNavLink } from 'carbon-components-react/es/components/UIShell';
import SideNavMenuLink from './side-nav-menu-link';
import { carbonizeIcon } from './icon';
import { itemId, linkProps } from './item-type';

const mapItems = (items, { activeSection, setSection }) => items.map(item => (
  item.items.length ? (
    <MenuSection
      key={item.id}
      {...item}
      hover={item.id === activeSection}
      setSection={setSection}
    />
  ) : (
    <MenuItem key={item.id} {...item} />
  )
));


// SideNavMenuItem can't render an icon, SideNavLink can
const MenuItem = ({
  active, href, icon, id, title, type,
}) => (
  <SideNavLink id={itemId(id)} isActive={active} renderIcon={carbonizeIcon(icon)} {...linkProps({ type, href, id })}>
    {__(title)}
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

const MenuSection = ({
  active, hover, icon, id, items, title, setSection,
}) => (
  <SideNavMenuLink
    id={itemId(id, true)}
    isActive={active}
    forceHover={hover}
    onClick={(e) => {
      setSection({ id, items });
      e.stopPropagation();
    }}
    renderIcon={carbonizeIcon(icon)}
    title={__(title)}
  />
);

MenuSection.propTypes = {
  active: PropTypes.bool,
  hover: PropTypes.bool,
  icon: PropTypes.string,
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  setSection: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

MenuSection.defaultProps = {
  active: false,
  hover: false,
  icon: undefined,
};


const FirstLevel = ({ activeSection, menu, setSection }) => (
  <SideNavItems className="menu-items">
    {mapItems(menu, { setSection, activeSection })}
  </SideNavItems>
);

FirstLevel.propTypes = {
  activeSection: PropTypes.string,
  menu: PropTypes.any.isRequired,
  setSection: PropTypes.func.isRequired,
};

FirstLevel.defaultProps = {
  activeSection: undefined,
};

export default FirstLevel;
