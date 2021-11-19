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

  return (
    <div className="select_filter">
      <Select id="select_filter_dropdown" onChange={selectFilter} defaultValue={selectPlaceHolder} noLabel>
        <SelectItem
          disabled
          hidden
          value="placeholder-item"
          text={_('Choose a Filter').toString()}
        />
        { defSearches.length > 0
      && (
        <SelectItemGroup label={_('Global Filters').toString()}>
          {defSearches.map(({ id, description }) => (
            <SelectItem key={id} value={id} text={description} />
          ))}
        </SelectItemGroup>
      ) }
        { mySearches.length > 0
      && (
        <SelectItemGroup label={_('My Filters').toString()}>
          {mySearches.map(({ id, description }) => (
            <SelectItem key={id} value={id} text={description} />
          ))}
        </SelectItemGroup>
      ) }
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
