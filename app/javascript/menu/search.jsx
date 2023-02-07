import React from 'react';
import PropTypes from 'prop-types';

import Search from 'carbon-components-react/es/components/Search';
import { Search20 } from '@carbon/icons-react';
import { SideNavItems, SideNavItem } from 'carbon-components-react/es/components/UIShell';
import TooltipIcon from 'carbon-components-react/es/components/TooltipIcon';

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
        flat.push({ item, parents });
      }
    });
  };

  process(menuItems);
  return flat;
};

const MenuSearch = ({
  expanded, menu, onSearch, toggle,
}) => {
  if (!expanded) {
    return (
      <div className="menu-search">
        <SideNavItems>
          <SideNavItem className="padded vertical-center">
            <fieldset className="miq-fieldset">
              <legend className="miq-fieldset-legend legend-search">{__('Choose a Filter')}</legend>
              <div className="miq-fieldset-content">
                <div
                  tabIndex="0"
                  className="search_div"
                  role="button"
                  onClick={toggle}
                  onKeyPress={toggle}
                >
                  <TooltipIcon
                    direction="right"
                    tooltipText={__('Find')}
                  >
                    <Search20 />
                  </TooltipIcon>
                </div>
              </div>
            </fieldset>
          </SideNavItem>
        </SideNavItems>
      </div>
    );
  }

  const flatMenu = flatten(menu).map(({ item, parents }) => {
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
    <div className="menu-search">
      <SideNavItems>
        <SideNavItem className="padded">
          <fieldset className="miq-fieldset">
            <legend className="miq-fieldset-legend legend-search">{__('Choose a Filter')}</legend>
            <div className="miq-fieldset-content">
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

MenuSearch.propTypes = {
  expanded: PropTypes.bool.isRequired,
  menu: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
  })).isRequired,
  onSearch: PropTypes.func,
  toggle: PropTypes.func,
};

MenuSearch.defaultProps = {
  onSearch: () => null,
  toggle: () => null,
};

export default MenuSearch;
