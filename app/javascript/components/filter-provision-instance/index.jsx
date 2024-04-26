import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Search32, Close32 } from '@carbon/icons-react';
import { Button, Checkbox, TextInput } from 'carbon-components-react';

/** Component to filter the images at provisioning instances page. */
const FilterProvisionInstance = ({
  hideDeprecated, searchText, url, showCheckbox,
}) => {
  const [data, setData] = useState({
    loading: false,
    searchText,
    hideDeprecated,
  });

  useEffect(() => {
    if (data.loading) {
      $.post(`${url}?search_text=${encodeURIComponent(data.searchText)}&hide_deprecated_templates=${data.hideDeprecated}`);
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
      <div className="col-md-7 checkbox_wrapper">
        {
          showCheckbox && (
            <Checkbox
              id="hide_deprecated"
              labelText="Hide Deprecated"
              disabled={data.loading}
              checked={data.hideDeprecated}
              onChange={() => setData({ ...data, loading: true, hideDeprecated: !data.hideDeprecated })}
            />
          )
        }
      </div>
      <div className="col-md-5 search_bar_wrapper">
        <div className="search_bar">
          <TextInput
            hideLabel
            value={data.searchText}
            placeholder={__('Search with name')}
            labelText={__('Search')}
            id="filter_with_name"
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

export default FilterProvisionInstance;

FilterProvisionInstance.propTypes = {
  hideDeprecated: PropTypes.bool,
  searchText: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  showCheckbox: PropTypes.bool.isRequired,
};

FilterProvisionInstance.defaultProps = {
  hideDeprecated: false,
};
