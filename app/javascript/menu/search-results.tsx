import React from 'react';
import { SideNavItems, SideNavMenuItem } from '@carbon/react';
import { itemId, linkProps } from './item-type';
import type { SearchResultType } from './menu-common-types';

type ResultItemProps = SearchResultType;

const ResultItem: React.FC<ResultItemProps> = ({ item, titles }) => {
  const tLength = titles.length;
  return (
    <SideNavMenuItem className="miq-menu-search-result-item" id={itemId(item.id as string)} isActive={item.active} {...linkProps(item)}>
      <p className="menu-search-title">
        {titles?.[tLength - 1]}
      </p>
      <p className="menu-search-parent">
        {(tLength > 1) && titles[0]}
        {(tLength > 2) && ' / '}
        {(tLength > 2) && titles[1]}
      </p>
    </SideNavMenuItem>
  );
};

type CountProps = {
  length: number;
};

// can't use raw p as a descendant of items
const Count: React.FC<CountProps> = ({ length }) => (
  <p>{sprintf(__('Results %s'), length)}</p>
);

type SearchResultsProps = {
  results: SearchResultType[];
};

// always expanded, or null
const SearchResults: React.FC<SearchResultsProps> = ({ results }) => (
  <SideNavItems className="menu-results">
    <Count length={results.length} />

    {results.map(({ item, titles }, index) => (
      <ResultItem key={`${item.id}_${index.toString()}`} item={item} titles={titles} />
    ))}
  </SideNavItems>
);

export default SearchResults;
