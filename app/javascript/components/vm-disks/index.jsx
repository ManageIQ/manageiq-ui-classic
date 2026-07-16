import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';
import { tableData } from './helper';

const VmDisks = ({
  disks = [],
}) => {
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
  disks: PropTypes.arrayOf(
    PropTypes.shape({
      deviceName: PropTypes.string,
      diskType: PropTypes.string,
      mode: PropTypes.string,
      partitionsAligned: PropTypes.string,
      size: PropTypes.string,
      sizeOnDisk: PropTypes.string,
      usedPercent: PropTypes.string,
    })
  ),
};

export default VmDisks;
