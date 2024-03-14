import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import FilterNamespace from './FilterNamespace';
import MiqDataTable from '../miq-data-table';
import NotificationMessage from '../notification-message';
import { CellAction } from '../miq-data-table/helper';
import {
  methodSelectorHeaders, formatMethods, searchUrl, namespaceUrls,
} from './helper';
import './style.scss';

/** Component to search and select AeMethods. */
const NamespaceSelector = ({ onSelectMethod, selectedIds }) => {
  const [data, setData] = useState({
    domains: [],
    methods: [],
    loading: true,
    searchText: undefined,
    selectedDomain: undefined,
  });

  /** Function to update the component state data. */
  const updateData = (updatedData) => setData({ ...data, ...updatedData });

  /** Loads the 'domains' and 'methods' from its respective URL's during the component's onLoad event. */
  useEffect(() => {
    Promise.all([
      http.get(namespaceUrls.aeDomainsUrl),
      http.get(namespaceUrls.aeMethodsUrl)])
      .then(([{ domains }, { methods }]) => updateData({ loading: false, domains, methods: formatMethods(methods) }));
  }, []);

  /** Function to handle search text and drop-down item onchange events. */
  const onSearch = (filterData) => {
    updateData({ loading: true });
    const searchText = filterData.searchText ? filterData.searchText : data.searchText;
    const selectedDomain = filterData.selectedDomain ? filterData.selectedDomain : data.selectedDomain;
    const url = searchUrl(selectedDomain, searchText);
    http.get(url)
      .then(({ methods }) => {
        updateData({
          loading: false, selectedDomain, searchText, methods: formatMethods(methods),
        });
      });
  };

  /** Function to handle the click events for the list. */
  const onCellClick = (selectedRow, cellType, checked) => {
    const selectedItems = cellType === CellAction.selectAll
      ? data.methods.map((item) => item.id)
      : [selectedRow];
    onSelectMethod({ selectedItems, cellType, checked });
  };

  /** Function to render the contents of the list. */
  const renderContents = () => (data.methods && data.methods.length > 0
    ? (
      <MiqDataTable
        headers={methodSelectorHeaders}
        stickyHeader
        rows={data.methods}
        mode="miq-inline-method-list"
        rowCheckBox
        sortable={false}
        gridChecks={selectedIds}
        onCellClick={(selectedRow, cellType, event) => onCellClick(selectedRow, cellType, event.target.checked)}
      />
    )
    : <NotificationMessage type="error" message={__('No methods available.')} />);

  return (
    <div className="inline-method-selector">
      <FilterNamespace domains={data.domains} onSearch={(filterData) => onSearch(filterData)} />
      <div className="inline-contents-wrapper">
        {
          data.loading
            ? <Loading active small withOverlay={false} className="loading" />
            : renderContents()
        }
      </div>
    </div>
  );
};

export default NamespaceSelector;

NamespaceSelector.propTypes = {
  onSelectMethod: PropTypes.func.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.any).isRequired,
};
