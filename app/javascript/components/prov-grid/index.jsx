import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';
import { headerData, rowData } from '../miq-data-table/helper';
import { appendSortData } from './helper';

const ProvGrid = ({ initialData }) => {
  const [data, setData] = useState({ initialData });

  const { headerKeys, headerItems } = headerData(data.initialData.headers, false);
  const miqRows = rowData(headerKeys, data.initialData.rows, true);
  const sortedHeaders = appendSortData(data.initialData.headers, headerItems);

  /** Function to sort the table */
  const onSort = (itemKey) => {
    const {
      headers, recordId, type, fieldId, field, spec,
    } = data.initialData;

    const selectedHeader = headers.find((item) => item.text === itemKey);
    if (selectedHeader) {
      miqSparkleOn();
      const url = `sort_${type}_grid/${recordId}?field_id=${fieldId}&sort_choice=${selectedHeader.sort_choice}&field=${field}&spec=${spec}`;
      miqAjax(url).then((response) => {
        setData({ ...data, initialData: JSON.parse(response).initialData });
      });
    }
  };

  /** Function to select a row in the table */
  const onSelect = (selectedRow) => {
    const { recordId, fieldId } = data.initialData;
    miqSparkleOn();
    const url = `/miq_request/prov_field_changed/?${fieldId}=${selectedRow.id}&id=${recordId}`;
    miqAjax(url).then(() => miqSparkleOff());
  };

  return (
    <div className="prov_grid_item">
      <MiqDataTable
        headers={sortedHeaders}
        rows={miqRows.rowItems}
        mode={`prov-${data.initialData.type}-grid-data-table`}
        sortable={miqRows.rowItems.length > 1}
        gridChecks={[data.initialData.selected]}
        onCellClick={(selectedRow) => onSelect(selectedRow)}
        onSort={(headerItem) => onSort(headerItem.key)}
      />
    </div>
  );
};

ProvGrid.propTypes = {
  initialData: PropTypes.shape({
    headers: PropTypes.arrayOf(PropTypes.any),
    rows: PropTypes.arrayOf(PropTypes.any),
    selected: PropTypes.string,
    recordId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string.isRequired,
    fieldId: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    spec: PropTypes.bool.isRequired,
  }).isRequired,
};

export default ProvGrid;
