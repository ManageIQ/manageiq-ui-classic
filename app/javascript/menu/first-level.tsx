import React from 'react';
import { SideNavItems, SideNavLink } from '@carbon/react';
import SideNavMenuLink from './side-nav-menu-link';
import { carbonizeIcon } from './icon';
import { itemId, linkProps } from './item-type';
import type { MenuItemType } from './menu-common-types';

type MenuRefsType = {
  prevRef?: React.RefObject<HTMLAnchorElement | null>;
  nextRef?: React.RefObject<HTMLAnchorElement | null>;
};

type MenuItemProps = {
  active?: boolean;
  href?: string;
  icon?: string;
  id?: string;
  title: string;
  type?: string;
  ref?: React.Ref<HTMLAnchorElement>;
};

type MenuSectionProps = {
  active?: boolean;
  expanded: boolean;
  hover?: boolean;
  icon?: string;
  id?: string;
  items?: MenuItemType[];
  title: string;
  onSelect: (data: { id?: string; items?: MenuItemType[] }) => void;
  itemPosition: number;
  ref?: React.Ref<HTMLAnchorElement>;
};

type FirstLevelProps = {
  activeSection?: string;
  expanded: boolean;
  menu: MenuItemType[];
  onSelect: (data: { id?: string; items?: MenuItemType[] }) => void;
  refObject: MenuRefsType;
};

type MapItemsOptions = {
  activeSection?: string;
  onSelect: (data: { id?: string; items?: MenuItemType[] }) => void;
  refObject: MenuRefsType;
};

const MenuSection: React.FC<MenuSectionProps> = ({
  active = false,
  expanded,
  hover = false,
  icon,
  id,
  items,
  title,
  onSelect,
  itemPosition,
  ref,
}) => {
  const IconComponent = carbonizeIcon(icon);
  return (
    <SideNavMenuLink
      expanded={expanded}
      id={itemId(id as string, true)}
      isActive={active}
      forceHover={hover}
      onClick={(e) => {
        onSelect({ id, items });
        e.stopPropagation();
      }}
      ref={ref}
      renderIcon={IconComponent as React.ComponentType}
      title={__(title)}
      itemPosition={itemPosition}
    />
  );
};

// SideNavMenuItem can't render an icon, SideNavLink can
const MenuItem: React.FC<MenuItemProps> = ({
  active = false,
  href,
  icon,
  id,
  title,
  type = 'default',
  ref,
}) => {
  const IconComponent = carbonizeIcon(icon);
  return (
    <SideNavLink
      id={itemId(id as string)}
      isActive={active}
      ref={ref}
      renderIcon={IconComponent as React.ComponentType}
      {...linkProps({ type, href, id })}
    >
      {__(title)}
    </SideNavLink>
  );
};

const mapItems = (
  items: MenuItemType[],
  expanded: boolean,
  { activeSection, onSelect, refObject: { prevRef, nextRef } }: MapItemsOptions
) =>
  items.map((item, itemPosition) => {
    const prev = items[itemPosition - 1]; // Retrieve the previous item in the menu

    // Set the reference to the previous/next item relatively to the selected one
    const ref = (item.id === activeSection && prevRef)
      || (prev && prev.id === activeSection && nextRef)
      || undefined;

    const props = {
      ref,
      ...item,
    };

    return item?.items?.length ? (
      <MenuSection
        key={item.id}
        {...props}
        hover={item.id === activeSection}
        onSelect={onSelect}
        expanded={expanded}
        itemPosition={itemPosition}
      />
    ) : (
      <MenuItem key={item.id} {...props} />
    );
  });

const FirstLevel: React.FC<FirstLevelProps> = ({
  activeSection,
  expanded,
  menu,
  onSelect,
  refObject,
}) => (
  <SideNavItems className="menu-items">
    {mapItems(menu, expanded, {
      onSelect,
      activeSection,
      refObject,
    })}
  </SideNavItems>
);

export default FirstLevel;
