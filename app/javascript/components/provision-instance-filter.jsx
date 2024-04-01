import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextInput, Button } from 'carbon-components-react';
import { Search32 } from '@carbon/icons-react';

const ProvisionInstanceFilter = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  return (
    <div className="provision-instance-filter">
      <TextInput
        id="search_input"
        labelText="Search"
        placeholder="Enter search term"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Button
        kind="primary"
        iconDescription="Search"
        onClick={handleSearch}
      >
        <Search32 />
      </Button>
    </div>
  );
};

ProvisionInstanceFilter.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default ProvisionInstanceFilter;
