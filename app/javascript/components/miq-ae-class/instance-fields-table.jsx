import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';

const InstanceFieldsTable = ({ fields, isStateClass, onEditField }) => {
  // Build table headers
  const headers = [
    { key: 'name', header: __('Name') },
    { key: 'value', header: __('Value') },
  ];

  if (isStateClass) {
    headers.push(
      { key: 'on_entry', header: __('On Entry') },
      { key: 'on_exit', header: __('On Exit') },
      { key: 'on_error', header: __('On Error') },
      { key: 'max_retries', header: __('Max Retries') },
      { key: 'max_time', header: __('Max Time') }
    );
  }

  headers.push(
    { key: 'collect', header: __('Collect') },
    { key: 'message', header: __('Message') },
    { key: 'edit', header: __('Edit') }
  );

  // Build table rows using the same pattern as class_field_data
  const rows = fields.map((field, index) => {
    const row = {
      id: `field_${index}`,
      clickable: false,
      name: {
        icon: field.icons, // Array of icon class strings from backend
        text: `${field.display_name}${field.name !== field.display_name ? ` (${field.name})` : ''}`,
      },
      value: {
        text: field.value || '',
      },
    };

    if (isStateClass) {
      row.on_entry = { text: field.value_on_entry || '' };
      row.on_exit = { text: field.value_on_exit || '' };
      row.on_error = { text: field.value_on_error || '' };
      row.max_retries = { text: field.value_max_retries || '' };
      row.max_time = { text: field.value_max_time || '' };
    }

    row.collect = { text: field.value_collect || '' };
    row.message = { text: field.message || '' };
    row.edit = {
      is_button: true,
      alt: __('Edit'),
      title: __('Edit'),
      text: __('Edit'),
      callback: () => onEditField(field, index),
    };

    return row;
  });

  const handleCellClick = (selectedRow) => {
    // Extract the field index from the row id (format: "field_0", "field_1", etc.)
    const fieldIndex = parseInt(selectedRow.id.split('_')[1], 10);
    const field = fields[fieldIndex];
    onEditField(field, fieldIndex);
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <MiqDataTable
        headers={headers}
        rows={rows}
        showPagination={false}
        mode="instance-fields"
        onCellClick={handleCellClick}
      />
    </div>
  );
};

InstanceFieldsTable.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    display_name: PropTypes.string,
    icons: PropTypes.arrayOf(PropTypes.string),
    aetype: PropTypes.string,
    datatype: PropTypes.string,
    value: PropTypes.string,
    value_collect: PropTypes.string,
    value_on_entry: PropTypes.string,
    value_on_exit: PropTypes.string,
    value_on_error: PropTypes.string,
    value_max_retries: PropTypes.string,
    value_max_time: PropTypes.string,
    message: PropTypes.string,
  })).isRequired,
  isStateClass: PropTypes.bool.isRequired,
  onEditField: PropTypes.func.isRequired,
};

export default InstanceFieldsTable;
