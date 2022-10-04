import React from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';
import { headerData, rowData } from '../miq-data-table/helper';
import { appendSortData } from './helper';

const ProvGrid = ({
  type, fieldId, initialData,
}) => {
  const { headerKeys, headerItems } = headerData(initialData.headers, false);
  const miqRows = rowData(headerKeys, initialData.rows, true);
  const sortedHeaders = appendSortData(initialData.headers, headerItems);

  const onSort = (itemKey) => {
    const selectedHeader = initialData.headers.find((item) => item.text === itemKey);
    if (selectedHeader) {
      const sortUrl = `sort_${type}_grid/${initialData.recordId}?field_id=${fieldId}&sort_choice=${selectedHeader.sort_choice}`;
      window.miqJqueryRequest(sortUrl);
    }
  };

  const onSelect = (selectedRow) => {
    miqSparkleOn();
    const url = `/miq_request/prov_field_changed/?${fieldId}=${selectedRow.id}&id=${initialData.recordId}`;
    miqAjax(url).then(() => miqSparkleOff());
  };

  const renderDataTable = () => (
    <MiqDataTable
      headers={sortedHeaders}
      rows={miqRows.rowItems}
      mode={`prov-${type}-grid-data-table`}
      sortable
      gridChecks={[initialData.selected]}
      onCellClick={(selectedRow) => onSelect(selectedRow)}
      onSort={(headerItem) => onSort(headerItem.key)}
    />
  );

  return (
    renderDataTable()
  );
};

ProvGrid.propTypes = {
  type: PropTypes.string.isRequired,
  fieldId: PropTypes.string.isRequired,
  initialData: PropTypes.shape({
    headers: PropTypes.arrayOf(PropTypes.any),
    rows: PropTypes.arrayOf(PropTypes.any),
    selected: PropTypes.string,
    recordId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default ProvGrid;
