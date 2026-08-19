import { find } from 'lodash';
import { flatten } from './search';
import type { MenuItemType, FlatMenuItemType } from './menu-common-types';

type FlatMenuItemWithHrefType = FlatMenuItemType & {
  href?: string;
};

const unsetActive = (menu: MenuItemType[]): MenuItemType[] => menu.map((item) => ({
  ...item,
  active: false,
  items: item.items && unsetActive(item.items),
}));

type UpdateActiveItemFunction = {
  (): void;
  setMenu?: (menu: MenuItemType[]) => void;
};

export const updateActiveItem: UpdateActiveItemFunction = () => {
  const { menu } = ManageIQ;
  const { setMenu } = updateActiveItem;

  const deactivated = unsetActive(menu);

  const flat: FlatMenuItemWithHrefType[] = flatten(deactivated).map(({ item, parents }) => ({
    href: item.href,
    item,
    parents,
  }));

  const currentUrl = `${document.location.pathname}${document.location.hash}`;

  const current = find(flat, { href: currentUrl });

  if (!current) {
    return;
  }

  current.item.active = true;
  current.parents.forEach((p: MenuItemType) => {
    p.active = true;
  });

  if (setMenu) {
    setMenu(deactivated);
  }
};
