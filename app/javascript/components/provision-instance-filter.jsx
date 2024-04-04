import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextInput, Button } from 'carbon-components-react';
import { Search32 } from '@carbon/icons-react';

const ProvisionInstanceFilter = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => { 
    const endpoint = `/miq_request_methods/pre_prov?search_input=${encodeURIComponent(searchQuery)}`;
    fetch(endpoint)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (onSearch && typeof onSearch === 'function') {
          onSearch(data);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
      });
  };


  return (
    <div className="provision-instance-filter">
      <TextInput
        id="search_input"
	name="search_input"
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
