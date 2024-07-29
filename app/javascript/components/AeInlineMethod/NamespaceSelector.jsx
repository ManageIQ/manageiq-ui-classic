import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { Loading } from 'carbon-components-react';
import { debounce } from 'lodash';
import FilterNamespace from './FilterNamespace';
import MiqDataTable from '../miq-data-table';
import NotificationMessage from '../notification-message';
import { CellAction } from '../miq-data-table/helper';
import {
  methodSelectorHeaders, formatMethods, searchUrl, namespaceUrls,
} from './helper';
import './style.scss';

const NamespaceSelector = ({ onSelectMethod, selectedIds }) => {
  const [filterData, setFilterData] = useState({ searchText: '', selectedDomain: '' });

  /** Loads the domains and stores in domainData for 60 seconds. */
  const { data: domainsData, isLoading: domainsLoading } = useQuery(
    'domainsData',
    async() => (await http.get(namespaceUrls.aeDomainsUrl)).domains,
    {
      staleTime: 60000,
    }
  );

  /** Loads the methods and stores in methodsData for 60 seconds.
   * If condition works on page load
   * Else part would work if there is a change in filterData.
   */
  const { data, isLoading: methodsLoading } = useQuery(
    ['methodsData', filterData.searchText, filterData.selectedDomain],
    async() => {
      if (!filterData.searchText && !filterData.selectedDomain) {
        const response = await http.get(namespaceUrls.aeMethodsUrl);
        return formatMethods(response.methods);
      }
      const url = searchUrl(filterData.selectedDomain, filterData.searchText);
      const response = await http.get(url);
      return formatMethods(response.methods);
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 60000,
    }
  );

  /** Debounce the search text by delaying the text input provided to the API. */
  const debouncedSearch = debounce((newFilterData) => {
    setFilterData(newFilterData);
  }, 300);

  /** Function to handle the onSearch event during a filter change event. */
  const onSearch = useCallback(
    (newFilterData) => debouncedSearch(newFilterData),
    [debouncedSearch]
  );

  /** Function to handle the click event of a cell in the data table. */
  const onCellClick = (selectedRow, cellType, checked) => {
    const selectedItems = cellType === CellAction.selectAll
      ? data && data.map((item) => item.id)
      : [selectedRow];
    onSelectMethod({ selectedItems, cellType, checked });
  };

  /** Function to render the list which depends on the data and selectedIds.
   * List is memoized to prevent unnecessary re-renders when other state values change. */
  const renderContents = useMemo(() => {
    if (!data || data.length === 0) {
      return <NotificationMessage type="info" message={__('No methods available.')} />;
    }

    return (
      <MiqDataTable
        headers={methodSelectorHeaders}
        stickyHeader
        rows={data}
        mode="miq-inline-method-list"
        rowCheckBox
        sortable={false}
        gridChecks={selectedIds}
        onCellClick={(selectedRow, cellType, event) => onCellClick(selectedRow, cellType, event.target.checked)}
      />
    );
  }, [data, selectedIds]);

  return (
    <div className="inline-method-selector">
      <FilterNamespace domains={domainsData} onSearch={onSearch} />
      <div className="inline-contents-wrapper">
        {(domainsLoading || methodsLoading)
          ? <Loading active small withOverlay={false} className="loading" />
          : renderContents}
      </div>
    </div>
  );
};

NamespaceSelector.propTypes = {
  onSelectMethod: PropTypes.func.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default NamespaceSelector;
