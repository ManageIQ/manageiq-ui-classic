import React from 'react';
import PropTypes from 'prop-types';

import { SideNavItems, SideNavMenuItem } from 'carbon-components-react/es/components/UIShell';
import { itemId, linkProps } from './item-type';

const ResultItem = ({ item, titles }) => {
  const tLength = titles.length;
  return (
    <SideNavMenuItem id={itemId(item.id)} isActive={item.active} {...linkProps(item)}>
      <p className="menu-search-title">
        {titles[tLength - 1]}
      </p>
      <p className="menu-search-parent">
        {(tLength > 1) && titles[0]}
        {(tLength > 2) && ' / '}
        {(tLength > 2) && titles[1]}
      </p>
    </SideNavMenuItem>
  );
};

// can't use raw p as a descendant of items
const Count = ({ length }) => <p>{sprintf(__('Results %s'), length)}</p>;

Count.propTypes = {
  length: PropTypes.number.isRequired,
};

// always expanded, or null
const SearchResults = ({ results }) => (
  <SideNavItems className="menu-results">
    <Count length={results.length} />

    {results.map(({ item, titles }, index) => (
      <ResultItem key={`${item.id}_${index.toString()}`} item={item} titles={titles} />
    ))}
  </SideNavItems>
);

SearchResults.propTypes = {
  results: PropTypes.arrayOf(PropTypes.shape({
    item: PropTypes.shape({}).isRequired,
    titles: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
};

ResultItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
  }).isRequired,
  titles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SearchResults;
