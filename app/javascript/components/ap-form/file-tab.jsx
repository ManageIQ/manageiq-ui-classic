import { useState } from 'react';
import { useFieldApi, useFormApi } from '@@ddf';
import { TextInput, Checkbox, Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import MiqDataTable from '../miq-data-table';

const FileTab = (props) => {
  const {
    input: { value = [], name },
  } = useFieldApi(props);
  const formOptions = useFormApi();

  const [formData, setFormData] = useState({
    fileName: '',
    fileContent: false,
    editingIndex: null,
  });

  const handleSubmit = () => {
    if (!formData.fileName.trim()) {
      add_flash(__('File Entry is required'), 'error');
      return;
    }

    const fileData = {
      target: formData.fileName,
      content: formData.fileContent,
    };

    let newValue;
    if (formData.editingIndex !== null) {
      newValue = [...value];
      newValue[formData.editingIndex] = fileData;
    } else {
      newValue = [...value, fileData];
    }

    formOptions.change(name, newValue);
    setFormData({ fileName: '', fileContent: false, editingIndex: null });
  };

  const handleEditClick = (index) => {
    const file = value[index];
    setFormData({
      fileName: file.target,
      fileContent: file.content || false,
      editingIndex: index,
    });
  };


  const handleCancel = () => {
    setFormData({ fileName: '', fileContent: false, editingIndex: null });
  };

  const handleDelete = (index) => {
    const newValue = value.filter((_, i) => i !== index);
    formOptions.change(name, newValue);
    // Clear form if we were editing the deleted item
    if (formData.editingIndex === index) {
      setFormData({ fileName: '', fileContent: false, editingIndex: null });
    }
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
      const row = {
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
      return row;
    })
    .filter(Boolean);

  return (
    <div className="ap-form-file">
      <h3>{__('File Entry')}</h3>
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <TextInput
          id="file-name"
          labelText={__('File Name')}
          value={formData.fileName}
          onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
          placeholder={__('Enter file path')}
        />
      </div>
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <Checkbox
          id="file-content"
          labelText={__('Collect Contents?')}
          checked={formData.fileContent}
          onChange={(e) => setFormData({ ...formData, fileContent: e.target.checked })}
        />
      </div>
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <Button
          kind="primary"
          size="sm"
          renderIcon={Add}
          onClick={handleSubmit}
        >
          {formData.editingIndex !== null ? __('Update') : __('Add')}
        </Button>
        {formData.editingIndex !== null && (
          <Button
            kind="secondary"
            size="sm"
            onClick={handleCancel}
            style={{ marginLeft: '8px' }}
          >
            {__('Cancel')}
          </Button>
        )}
      </div>
      {rows.length > 0 && (
        <MiqDataTable
          headers={headers}
          rows={rows}
          onCellClick={(selectedRow, action, event) => {
            if (action === 'buttonCallback' && selectedRow.callbackAction) {
              selectedRow.callbackAction();
            } else if (action === 'itemClick') {
              // Check if click was on action cell
              const clickedCell = event?.target?.closest('td');
              if (clickedCell && !clickedCell.classList.contains('action-cell-holder')) {
                const targetCell = selectedRow.cells?.find((c) => c.id.includes('target'));
                if (targetCell) {
                  const index = value.findIndex((f) => f.target === targetCell.value);
                  if (index !== -1) {
                    handleEditClick(index);
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
