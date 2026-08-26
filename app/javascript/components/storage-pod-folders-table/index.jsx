import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';
import { tableData } from './helper';

const StoragePodFoldersTable = ({ folders = [] }) => {
  const headers = [{ key: 'name', header: '' }];
  const rows = tableData(folders);

  const handleCellClick = (selectedRow) => {
    if (selectedRow?.id) {
      window.miqTreeActivateNode('storage_pod_tree', `f-${selectedRow.id}`);
    }
  };

  return (
    <div className="storage-pod-folders-table">
      <MiqDataTable
        headers={headers}
        rows={rows.rowItems}
        onCellClick={handleCellClick}
        mode="miq-data-table-default"
        size="md"
        sortable={false}
        rowCheckBox={false}
        showPagination={false}
      />
    </div>
  );
};

StoragePodFoldersTable.propTypes = {
  folders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

export default StoragePodFoldersTable;
