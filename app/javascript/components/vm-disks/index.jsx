import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';
import { tableData } from './helper';

const VmDisks = ({ recordId }) => {
  const [{ disks, isLoading }, setState] = useState({ disks: [], isLoading: true });

  useEffect(() => {
    API.get(`/api/vms/${recordId}/disks?expand=resources`)
      .then(({ resources }) => {
        setState({ disks: resources, isLoading: false });
      });
  }, [recordId]);

  if (isLoading) {
    return null;
  }

  const { headers, rows } = tableData(disks);

  return (
    <div id="vm_disks_div">
      <MiqDataTable
        headers={headers}
        rows={rows.rowItems}
        mode="vm-disks-table"
        size="sm"
      />
    </div>
  );
};

VmDisks.propTypes = {
  recordId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default VmDisks;
