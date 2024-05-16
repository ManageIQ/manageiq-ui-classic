import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Search32, Close32 } from '@carbon/icons-react';
import { Button, Checkbox, TextInput } from 'carbon-components-react';

/** Component to filter the images at provisioning instances page. */
const InstanceFilter = ({
  searchText, url,
}) => {
  console.log('Props received:', { searchText, url });
  const [data, setData] = useState({
    loading: false,
    searchText,
  });

  useEffect(() => {
    if (data.loading) {
      $.post(`${url}?search_text=${encodeURIComponent(data.searchText)}`);
    }
  }, [data.loading]);

  /** Function to handle the clear button's click event of the search bar. */
  const onClear = () => {
    const updatedData = searchText ? { loading: true } : {};
    setData({ ...data, searchText: '', ...updatedData });
  };

  /** Function to render the Clear button. */
  const renderClear = () => (
    <Button
      kind="secondary"
      disabled={data.loading}
      renderIcon={Close32}
      iconDescription={__('Clear')}
      hasIconOnly
      tooltipPosition="bottom"
      type="reset"
      onClick={onClear}
    />
  );

  /** Function to render the Lens button. */
  const renderLens = () => (
    <Button
      renderIcon={Search32}
      disabled={data.loading}
      iconDescription={__('Search')}
      hasIconOnly
      tooltipPosition="bottom"
      className="search_button"
      onClick={() => setData({ ...data, loading: true })}
    />
  );

  return (
    <div className="miq-filter-provision-instance">
      <div className="col-md-5 search_bar_wrapper">
        <div className="search_bar">
          <TextInput
            hideLabel
            value={data.searchText}
            placeholder={__('Search with name')}
            labelText={__('Search')}
            id="filter_the_name"
            disabled={data.loading}
            onChange={(event) => setData({ ...data, searchText: event.target.value })}
          />
          { data.searchText && renderClear() }
          { renderLens() }
        </div>
      </div>
    </div>
  );
};

export default InstanceFilter;

InstanceFilter.propTypes = {
  searchText: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};


