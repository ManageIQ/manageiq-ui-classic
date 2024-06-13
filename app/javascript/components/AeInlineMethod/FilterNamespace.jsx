import React from 'react';
import PropTypes from 'prop-types';
import {
  Select, SelectItem, Search,
} from 'carbon-components-react';
import { noSelect } from './helper';

const FilterNamespace = ({ domains, onSearch }) => {
  /** Function to render the search text. */
  const renderSearchText = () => (
    <div className="search-wrapper">
      <label className="bx--label" htmlFor="Search">{__('Type to search')}</label>
      <Search
        id="search-method"
        labelText={__('Search')}
        placeholder={__('Search with Name or Relative path')}
        onClear={() => onSearch({ searchText: noSelect })}
        onChange={(event) => onSearch({ searchText: event.target.value || noSelect })}
      />
    </div>
  );

  /** Function to render the domain items in a drop-down list. */
  const renderDomainList = () => (
    <Select
      id="domain_id"
      labelText="Select a domain"
      defaultValue="option"
      size="lg"
      onChange={(event) => onSearch({ selectedDomain: event.target.value })}
    >
      <SelectItem value={noSelect} text="None" />
      {
        domains.map((domain) => <SelectItem key={domain.id} value={domain.id} text={domain.name} />)
      }
    </Select>
  );

  return (
    <div className="inline-filters">
      {renderSearchText()}
      {domains && renderDomainList()}
    </div>
  );
};

export default FilterNamespace;

FilterNamespace.propTypes = {
  domains: PropTypes.arrayOf(PropTypes.any),
  onSearch: PropTypes.func.isRequired,
};

FilterNamespace.defaultProps = {
  domains: undefined,
};
