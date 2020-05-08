import React from 'react';
import PropTypes from 'prop-types';

import { SideNavItems, SideNavMenuItem } from 'carbon-components-react/es/components/UIShell';
import { itemId, linkProps } from './item-type';

const ResultItem = ({ item, titles }) => (
  <SideNavMenuItem
    id={itemId(item.id)}
    isActive={item.active}
    {...linkProps(item)}
  >
    <p className="menu-search-title">
      {titles[titles.length - 1]}
    </p>
    <p className="menu-search-parent">
      {(titles.length > 1) && titles[0]}
      {(titles.length > 2) && ' / '}
      {(titles.length > 2) && titles[1]}
    </p>
  </SideNavMenuItem>
);

// always expanded, or null
export const SearchResults = ({ results }) => (
  <SideNavItems>
    <p>
      {__("Results")}
      &nbsp;
      ({results.length})
    </p>

    {results.map(({ item, titles }) => (
      <ResultItem
        key={item.id}
        item={item}
        titles={titles}
      />
    ))}
  </SideNavItems>
);

SearchResults.propTypes = {
  results: PropTypes.arrayOf(PropTypes.shape({
    item: PropTypes.shape({}).isRequired,
    titles: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
};
