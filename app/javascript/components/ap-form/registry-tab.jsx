import { useFieldApi, useFormApi } from '@@ddf';
import { Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import MiqDataTable from '../miq-data-table';

const RegistryTab = (props) => {
  const {
    input: { value = [], name },
  } = useFieldApi(props);
  const formOptions = useFormApi();

  const { onOpenModal, onEditClick } = props;

  const handleDelete = (index) => {
    const newValue = value.filter((_, i) => i !== index);
    formOptions.change(name, newValue);
  };

  const headers = [
    { key: 'hive', header: __('Registry Hive') },
    { key: 'key', header: __('Registry Key') },
    { key: 'value', header: __('Registry Value') },
    { key: 'actions', header: __('Actions'), actionCell: true },
  ];

  const rows = value
    .map((entry, originalIndex) => {
      if (!entry || !entry.key) {
        return null;
      }
      return {
        id: `reg_${originalIndex}`,
        hive: entry.hive,
        key: entry.key,
        value: entry.value,
        actions: {
          is_button: true,
          text: __('Delete'),
          alt: __('Delete'),
          title: __('Delete this entry'),
          kind: 'danger--ghost',
          size: 'sm',
          callback: () => handleDelete(originalIndex),
        },
        clickable: true,
      };
    })
    .filter(Boolean);

  return (
    <div className="ap-form-registry">
      <h3>{__('Registry Entry')}</h3>
      <div className="ap-form-tab-toolbar">
        <Button
          kind="primary"
          size="sm"
          renderIcon={Add}
          onClick={onOpenModal}
        >
          {__('Add Registry Entry')}
        </Button>
      </div>
      {rows.length > 0 && (
        <MiqDataTable
          headers={headers}
          rows={rows}
          onCellClick={(selectedRow, action, event) => {
            if (action === 'buttonCallback' && selectedRow.callbackAction) {
              selectedRow.callbackAction();
            } else if (action === 'itemClick') {
              const clickedCell = event?.target?.closest('td');
              if (clickedCell && !clickedCell.classList.contains('action-cell-holder')) {
                const keyCell = selectedRow.cells?.find((c) => c.id.includes('key'));
                const valueCell = selectedRow.cells?.find((c) => c.id.includes('value'));
                if (keyCell && valueCell) {
                  const index = value.findIndex((e) => e.key === keyCell.value && e.value === valueCell.value);
                  if (index !== -1) {
                    onEditClick(index, value[index]);
                  }
                }
              }
            }
          }}
          mode="ap-form-registry"
        />
      )}
    </div>
  );
};

export default RegistryTab;
