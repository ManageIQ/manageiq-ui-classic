import React from 'react';
import PropTypes from 'prop-types';
import {
  Select, SelectItem, SelectItemGroup, Button,
} from 'carbon-components-react';

const FilterDropdown = ({
  defSearches, mySearches, filterSelected, defaultSelected, selectedFilter,
}) => {
  const selectPlaceHolder = selectedFilter ? selectedFilter.id : 'placeholder-item';
  const selectFilter = (value) => {
    const id = value.target.value;
    miqAjaxButton(`/${ManageIQ.controller}/${filterSelected}/${id}`);
  };
  const setDefaultFilter = () => {
    if (selectedFilter.id !== undefined) {
      miqAjaxButton(`/${ManageIQ.controller}/${defaultSelected}/${selectedFilter.id}`);
    }
  };

  /** Function to render the grouped items inside the drop down filter list. */
  const renderSelectItemGroup = (label, items) => (
    <SelectItemGroup label={label.toString()}>
      {items.map(({ id, description }) => (
        <SelectItem key={id} value={id} text={description} />
      ))}
    </SelectItemGroup>
  );

  return (
    <div className="select_filter">
      <fieldset className="miq-fieldset">
        <legend className="miq-fieldset-legend legend-filter-dropdown">{__('Choose a Filter')}</legend>
        <div className="miq-fieldset-content">
          <Select id="select_filter_dropdown" aria-label={__('Choose a Filter')} onChange={selectFilter} defaultValue={selectPlaceHolder} noLabel>
            <SelectItem
              disabled
              hidden
              value="placeholder-item"
              text={_('Choose a Filter').toString()}
            />
            { defSearches.length > 0 && renderSelectItemGroup(_('Global Filters'), defSearches) }
            { mySearches.length > 0 && renderSelectItemGroup(_('My Filters'), mySearches) }
          </Select>

          <Button
            id="set_default"
            className="default_button"
            title={_('Select a filter to set it as my default')}
            onClick={setDefaultFilter}
            size="sm"
            type="submit"
          >
            {__('Set Default')}
          </Button>
        </div>
      </fieldset>
    </div>
  );
};

FilterDropdown.propTypes = {
  defSearches: PropTypes.arrayOf(PropTypes.any).isRequired,
  mySearches: PropTypes.arrayOf(PropTypes.any).isRequired,
  filterSelected: PropTypes.string.isRequired,
  defaultSelected: PropTypes.string.isRequired,
  selectedFilter: PropTypes.objectOf(PropTypes.any),
};

FilterDropdown.defaultProps = {
  selectedFilter: undefined,
};

export default FilterDropdown;
