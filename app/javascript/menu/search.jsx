import React from 'react';
import PropTypes from 'prop-types';

import Search from 'carbon-components-react/es/components/Search';
import { Search20 } from '@carbon/icons-react';
import { SideNavItem } from 'carbon-components-react/es/components/UIShell';

export const flatten = (menuItems = []) => {
  const flat = [];

  const process = (items, parents = []) => {
    items.forEach((item) => {
      const newParents = [...parents, item];

      if (item.items && item.items.length) {
        // section
        process(item.items, newParents);
      } else {
        // item
        flat.push({
          item,
          parents,
        });
      }
    });
  }

  process(menuItems);
  return flat;
};

export const MenuSearch = ({ expanded, menu, onSearch }) => {
  if (! expanded) {
    return (
      <SideNavItem className="padded menu-search vertical-center">
        <Search20 />
      </SideNavItem>
    );
  }

  const flatMenu = flatten(menu)
    .map(({item, parents}) => {
      const titles = [...parents, item].map((p) => p.title);
      const haystack = titles.join(' ').toLocaleLowerCase();

      return {
        haystack,
        item,
        parents,
        titles,
      };
    });

  const searchResults = (string) => {
    if (!string || string.match(/^\s*$/)) {
      onSearch(null);
      return;
    }

    const needle = string.toLocaleLowerCase();
    const results = flatMenu.filter((item) => item.haystack.includes(needle));

    onSearch(results);
  };

  return (
    <SideNavItem className="padded menu-search">
      <Search
        size="sm"
        placeHolderText={__("Find")}
        labelText={__("Find") /* hidden in css */}
        onChange={(e) => searchResults(event.target.value)}
      />
    </SideNavItem>
  );
};

MenuSearch.propTypes = {
  expanded: PropTypes.bool.isRequired,
  menu: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
  })).isRequired,
  onSearch: PropTypes.func,
};

MenuSearch.defaultProps = {
  onSearch: () => null,
};
