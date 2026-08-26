import PropTypes from 'prop-types';
import { tableData, onSelectRender } from './helper';
import MiqDataTable from '../../miq-data-table';

const PxeImagesTable = ({
  initialData = [],
}) => {
  const { headers, rows } = tableData(initialData);
  const onSelect = (selectedRow) => onSelectRender(selectedRow);

  return (
    rows.length > 0 && (
      <MiqDataTable
        rows={rows}
        headers={headers}
        isSortable={false}
        onCellClick={(selectedRow) => onSelect(selectedRow)}
      />
    )
  );
};

export default PxeImagesTable;

PxeImagesTable.propTypes = {
  initialData: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    kernel: PropTypes.string,
    default_for_windows: PropTypes.bool,
  })),
};
