import React from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';
import { tableData } from './helper';
import NoRecordsFound from '../no-records-found';

const PxeTemplateFolders = ({ folders }) => {
  const { headers, rows } = tableData(folders);

  const handleCellClick = (row) => {
    if (row && row.id) {
      window.miqTreeActivateNode('customization_templates_tree', row.id);
    }
  };

  return (
    <div id="template_folders_div">
      {rows.rowItems.length > 0 ? (
        <MiqDataTable
          headers={headers}
          rows={rows.rowItems}
          onCellClick={handleCellClick}
          mode="template-folders"
        />
      ) : <NoRecordsFound />}
    </div>
  );
};

PxeTemplateFolders.propTypes = {
  folders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

PxeTemplateFolders.defaultProps = {
  folders: [],
};

export default PxeTemplateFolders;
