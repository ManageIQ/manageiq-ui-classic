import React from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';
import { rowData } from '../miq-data-table/helper';

const DiagnosticsOrphanedData = ({ initialData }) => {
  const headerKeys = initialData.headers.map((item) => item.key);
  const miqRows = rowData(headerKeys, initialData.rows, false);

  const renderTabContentHeader = () => (
    <div className="miq-custom-tab-content-header">
      <div className="tab-content-header-title">
        <h3>{initialData.pageTitle}</h3>
      </div>
    </div>
  );

  return (
    <>
      {renderTabContentHeader()}
      <MiqDataTable
        rows={miqRows.rowItems}
        headers={initialData.headers}
        showPagination={false}
        mode="diagnostics-orphaned-data-list"
        gridChecks={[]}
      />
    </>
  );
};

DiagnosticsOrphanedData.propTypes = {
  initialData: PropTypes.shape({
    headers: PropTypes.arrayOf(PropTypes.any),
    rows: PropTypes.arrayOf(PropTypes.any),
    pageTitle: PropTypes.string,
  }).isRequired,
};

export default DiagnosticsOrphanedData;
