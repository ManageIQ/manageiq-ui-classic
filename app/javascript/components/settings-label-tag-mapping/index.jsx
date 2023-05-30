import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'carbon-components-react';
import MiqDataTable from '../miq-data-table';
import { rowData } from '../miq-data-table/helper';
import NotificationMessage from '../notification-message';

/** Component to render the 'Map Tags' content */
const SettingsLabelTagMapping = ({ initialData }) => {
  const headerKeys = initialData.headers.map((item) => item.key);
  const miqRows = rowData(headerKeys, initialData.rows, false);

  const onSelect = (selectedRowId) => window.miqJqueryRequest(`/ops/label_tag_mapping_edit/${selectedRowId}`)

  /** Function to render a warning message */
  const renderWarning = () => (
    <div className="miq-custom-tab-content-notification">
      <NotificationMessage
        type="warning"
        // eslint-disable-next-line max-len
        message={__("Caution: Mappings with Resource Entity 'All-Entities' could cause overwriting existing tags on resources with mapped provider labels.")}
      />
    </div>
  );

  const renderTabContentHeader = () => (
    <div className="miq-custom-tab-content-header">
      <div className="tab-content-header-title">
        <h3>{__('Map Tags')}</h3>
      </div>
      <div className="tab-content-header-actions">
        <Button
          onClick={() => onSelect('')}
          onKeyPress={() => onSelect('')}
          title={__('Click on this row to create a new mapping rule')}
        >
          {__('Add Mapping Rule')}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {renderTabContentHeader()}
      {initialData.warning && renderWarning()}
      <MiqDataTable
        rows={miqRows.rowItems}
        headers={initialData.headers}
        onCellClick={(selectedRow) => onSelect(selectedRow.id)}
        showPagination={false}
        mode="settings-label-tag-mappings-list"
        gridChecks={[]}
      />
    </>
  );
};

SettingsLabelTagMapping.propTypes = {
  initialData: PropTypes.shape({
    headers: PropTypes.arrayOf(PropTypes.any),
    rows: PropTypes.arrayOf(PropTypes.any),
    warning: PropTypes.bool,
  }).isRequired,
};

export default SettingsLabelTagMapping;
