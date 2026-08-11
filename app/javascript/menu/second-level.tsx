import React from 'react';
import { SideNavItems, SideNavMenu, SideNavMenuItem } from '@carbon/react';
import { itemId, linkProps } from './item-type';
import type { MenuItemType } from './menu-common-types';

type MenuItemProps = {
  active?: boolean;
  href?: string;
  id?: string;
  title: string;
  type?: string;
  hideSecondary: () => void;
  ref?: React.Ref<HTMLAnchorElement>;
};

type MenuSectionProps = {
  active?: boolean;
  items?: MenuItemType[];
  title: string;
  hideSecondary: () => void;
  ref?: React.Ref<HTMLAnchorElement>;
};

type SecondLevelProps = {
  menu: MenuItemType[];
  hideSecondary: () => void;
  ref?: React.Ref<HTMLAnchorElement>;
};

const mapItems = (
  items: MenuItemType[],
  hideSecondary: () => void,
  MenuSectionComponent: React.ComponentType<MenuSectionProps>,
  MenuItemComponent: React.ComponentType<MenuItemProps>,
  ref?: React.Ref<HTMLAnchorElement>
) =>
  items.map((item, key) => {
    const Component = item?.items?.length
      ? MenuSectionComponent
      : MenuItemComponent;

    return (
      <Component
        hideSecondary={hideSecondary}
        key={item.id}
        {...item}
        {...(ref && key === 0 && { ref })}
      />
    );
  });

const MenuItem: React.FC<MenuItemProps> = ({
  active = false,
  href,
  id,
  title,
  type = 'default',
  hideSecondary,
  ref,
}) => (
  <SideNavMenuItem
    id={itemId(id as string)}
    isActive={active}
    ref={ref}
    {...linkProps({
      type,
      href,
      id,
      hideSecondary,
    })}
  >
    {__(title)}
  </SideNavMenuItem>
);

const MenuSection: React.FC<MenuSectionProps> = ({
  active = false,
  items = [],
  title,
  hideSecondary,
  ref,
}) => (
  <SideNavMenu
    isActive={active}
    defaultExpanded={active} // autoexpand active section
    ref={ref}
    title={__(title)}
  >
    {mapItems(items, hideSecondary, MenuSection, MenuItem)}
  </SideNavMenu>
);

const SecondLevel: React.FC<SecondLevelProps> = ({
  menu,
  hideSecondary,
  ref,
}) => (
  <SideNavItems>
    {mapItems(menu, hideSecondary, MenuSection, MenuItem, ref)}
  </SideNavItems>
);

export default SecondLevel;
