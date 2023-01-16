import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'carbon-components-react';
import MiqDataTable from '../miq-data-table';
import { rowData } from '../miq-data-table/helper';

const SettingsCompanyCategories = ({ initialData }) => {
  const headerKeys = initialData.headers.map((item) => item.key);
  const miqRows = rowData(headerKeys, initialData.rows, false);

  const onSelect = (selectedRowId) => window.miqJqueryRequest(`/ops/category_edit/${selectedRowId}`);

  const renderTabContentHeader = () => (
    <div className="miq-custom-tab-content-header">
      <div className="tab-content-header-title">
        <h3>{initialData.pageTitle}</h3>
      </div>
      <div className="tab-content-header-actions">
        <Button
          onClick={() => onSelect('')}
          onKeyPress={() => onSelect('')}
          title={__('Click to add a new category')}
        >
          {__('Add Category')}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {renderTabContentHeader()}
      <MiqDataTable
        rows={miqRows.rowItems}
        headers={initialData.headers}
        onCellClick={(selectedRow) => onSelect(selectedRow.id)}
        showPagination={false}
        mode="settings-company-categories-list"
        gridChecks={[]}
      />
    </>
  );
};

SettingsCompanyCategories.propTypes = {
  initialData: PropTypes.shape({
    headers: PropTypes.arrayOf(PropTypes.any),
    rows: PropTypes.arrayOf(PropTypes.any),
    pageTitle: PropTypes.string,
  }).isRequired,
};

export default SettingsCompanyCategories;
