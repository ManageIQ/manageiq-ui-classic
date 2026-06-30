import { useFieldApi, useFormApi } from '@@ddf';
import { Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import MiqDataTable from '../miq-data-table';

const FileTab = (props) => {
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
    { key: 'target', header: __('Name') },
    { key: 'content', header: __('Collect Contents?') },
    { key: 'actions', header: __('Actions'), actionCell: true },
  ];

  const rows = value
    .map((file, originalIndex) => {
      if (!file || !file.target) {
        return null;
      }
      return {
        id: `file_${originalIndex}`,
        target: file.target,
        content: file.content ? __('true') : __('false'),
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
    <div className="ap-form-file">
      <h3>{__('File Entry')}</h3>
      <div className="ap-form-tab-toolbar">
        <Button
          kind="primary"
          size="sm"
          renderIcon={Add}
          onClick={onOpenModal}
        >
          {__('Add File')}
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
                const targetCell = selectedRow.cells?.find((c) => c.id.includes('target'));
                if (targetCell) {
                  const index = value.findIndex((f) => f.target === targetCell.value);
                  if (index !== -1) {
                    onEditClick(index, value[index]);
                  }
                }
              }
            }
          }}
          mode="ap-form-file"
        />
      )}
    </div>
  );
};

export default FileTab;
