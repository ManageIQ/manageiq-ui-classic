import React from 'react';
import { Search as SearchIcon } from '@carbon/react/icons';
import {
  Search,
  SideNavItems,
  SideNavItem,
  Button,
} from '@carbon/react';
import type {
  MenuItemType,
  FlatMenuItemType,
  SearchResultType,
} from './menu-common-types';

export const flatten = (menuItems: MenuItemType[] = []) => {
  const flat: FlatMenuItemType[] = [];

  const process = (items: MenuItemType[], parents: MenuItemType[] = []) => {
    items.forEach((item) => {
      const newParents = [...parents, item];

      if (item.items && item.items.length) {
        // section
        process(item.items, newParents);
      } else {
        // item
        flat.push({ item, parents });
      }
    });
  };

  process(menuItems);
  return flat;
};

type MenuSearchProps = {
  expanded: boolean;
  menu: MenuItemType[];
  onSearch?: (results: SearchResultType[] | null) => void;
  toggle?: () => void;
};

const MenuSearch: React.FC<MenuSearchProps> = ({
  expanded,
  menu,
  onSearch = () => null,
  toggle = () => null,
}) => {
  if (!expanded) {
    return (
      <div className="menu-search miq-search-menu-option-collapsed">
        <SideNavItems>
          <SideNavItem className="padded vertical-center">
            <fieldset className="miq-fieldset">
              <div className="miq-fieldset-content">
                <div
                  tabIndex={0}
                  className="search_div"
                  role="button"
                  onClick={toggle}
                  onKeyDown={toggle}
                >
                  <Button
                    kind="ghost"
                    size="sm"
                    hasIconOnly
                    iconDescription={__('Find')}
                    renderIcon={(props) => <SearchIcon size={20} {...props} />}
                    tooltipAlignment="center"
                    tooltipPosition="right"
                  />
                </div>
              </div>
            </fieldset>
          </SideNavItem>
        </SideNavItems>
      </div>
    );
  }

  const flatMenu: SearchResultType[] = flatten(menu).map(
    ({ item, parents }) => {
      const titles = [...parents, item].map((p) => p.title);
      const haystack = titles.join(' ').toLocaleLowerCase();

      return {
        haystack,
        item,
        parents,
        titles,
      };
    }
  );

  const searchResults = (string: string) => {
    if (!string || string.match(/^\s*$/)) {
      onSearch(null);
      return;
    }

    const needle = string.toLocaleLowerCase();
    const results = flatMenu.filter((item) => item?.haystack?.includes(needle));
    onSearch(results);
  };

  return (
    <div className="menu-search">
      <SideNavItems>
        <SideNavItem className="padded">
          <fieldset className="miq-fieldset">
            <div className="miq-fieldset-content menu-search-field-wrapper">
              <Search
                size="sm"
                placeholder={__('Find')}
                labelText={__('Find') /* hidden in css */}
                onChange={(event) => searchResults(event.target.value)}
              />
            </div>
          </fieldset>
        </SideNavItem>
      </SideNavItems>
    </div>
  );
};

export default MenuSearch;
