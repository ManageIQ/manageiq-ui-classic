import React from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';
import { rowData } from '../miq-data-table/helper';
import NoRecordsFound from '../no-records-found';

const SettingsZone = ({ initialData }) => {
  if (initialData.rows.length === 0) {
    return <NoRecordsFound />;
  }
  const headerKeys = initialData.headers.map((item) => item.key);
  const miqRows = rowData(headerKeys, initialData.rows, false);

  const onSelect = (selectedRowId) => miqTreeActivateNode('settings_tree', `z-${selectedRowId}`);

  return (
    <MiqDataTable
      rows={miqRows.rowItems}
      headers={initialData.headers}
      onCellClick={(selectedRow) => onSelect(selectedRow.id)}
      showPagination={false}
      mode="settings-company-categories-list"
      gridChecks={[initialData.selected]}
    />
  );
};

SettingsZone.propTypes = {
  initialData: PropTypes.shape({
    headers: PropTypes.arrayOf(PropTypes.any),
    rows: PropTypes.arrayOf(PropTypes.any),
    pageTitle: PropTypes.string,
    selected: PropTypes.string,
  }).isRequired,
};

export default SettingsZone;
