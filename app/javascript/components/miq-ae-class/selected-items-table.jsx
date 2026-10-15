import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';

const SelectedItemsTable = ({ selectedItems }) => {
  const count = selectedItems.length;
  const headers = [
    {
      key: 'name',
      header: sprintf(n__('%d Item selected to copy', '%d Items selected to copy', count), count),
    },
  ];

  const rows = selectedItems.map((item, index) => ({
    id: `item_${index}`,
    name: { text: item },
  }));

  return (
    <div className="ae-selected-items-table">
      <MiqDataTable
        headers={headers}
        rows={rows}
        showPagination={false}
        mode="miq-ae-copy-items"
      />
    </div>
  );
};

SelectedItemsTable.propTypes = {
  selectedItems: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SelectedItemsTable;
