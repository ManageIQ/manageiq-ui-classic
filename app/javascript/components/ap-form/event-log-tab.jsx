import { useFieldApi, useFormApi } from '@@ddf';
import { Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import MiqDataTable from '../miq-data-table';

const EventLogTab = (props) => {
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
    { key: 'name', header: __('Name') },
    { key: 'message', header: __('Filter Message') },
    { key: 'level', header: __('Level') },
    { key: 'source', header: __('Source') },
    { key: 'num_days', header: __('# of Days') },
    { key: 'actions', header: __('Actions'), actionCell: true },
  ];

  const rows = value
    .map((entry, originalIndex) => {
      if (!entry || !entry.name) {
        return null;
      }
      return {
        id: `eventlog_${originalIndex}`,
        name: entry.name,
        message: entry.filter?.message || '',
        level: entry.filter?.level || '',
        source: entry.filter?.source || '',
        num_days: entry.filter?.num_days?.toString() || '0',
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
    <div className="ap-form-eventlog">
      <h3>{__('Event Log Entry')}</h3>
      <div className="ap-form-tab-toolbar">
        <Button
          kind="primary"
          size="sm"
          renderIcon={Add}
          onClick={onOpenModal}
        >
          {__('Add Event Log')}
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
                const nameCell = selectedRow.cells?.find((c) => c.id.includes('name'));
                if (nameCell) {
                  const index = value.findIndex((e) => e.name === nameCell.value);
                  if (index !== -1) {
                    onEditClick(index, value[index]);
                  }
                }
              }
            }
          }}
          mode="ap-form-eventlog"
        />
      )}
    </div>
  );
};

export default EventLogTab;
