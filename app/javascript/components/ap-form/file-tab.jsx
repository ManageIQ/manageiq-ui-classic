import { useState } from 'react';
import { useFieldApi, useFormApi } from '@@ddf';
import {
  Button, Modal, TextInput, Checkbox,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import MiqDataTable from '../miq-data-table';

const FileTab = (props) => {
  const {
    input: { value = [], name },
  } = useFieldApi(props);
  const formOptions = useFormApi();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalValues, setModalValues] = useState({ fileName: '', fileContent: false });
  const [editingIndex, setEditingIndex] = useState(null);
  const [errors, setErrors] = useState({});

  const handleOpenModal = () => {
    setModalValues({ fileName: '', fileContent: false });
    setEditingIndex(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalValues({ fileName: '', fileContent: false });
    setEditingIndex(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!modalValues.fileName || modalValues.fileName.trim() === '') {
      newErrors.fileName = __('File Entry is required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleModalSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const fileData = {
      target: modalValues.fileName,
      content: modalValues.fileContent || false,
    };

    let newValue;
    if (editingIndex !== null) {
      newValue = [...value];
      newValue[editingIndex] = fileData;
    } else {
      newValue = [...value, fileData];
    }

    formOptions.change(name, newValue);
    handleCloseModal();
  };

  const handleEditClick = (index) => {
    const file = value[index];
    setModalValues({
      fileName: file.target,
      fileContent: file.content || false,
    });
    setEditingIndex(index);
    setIsModalOpen(true);
  };

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
      <div style={{ marginBottom: '1rem' }}>
        <Button
          kind="primary"
          size="sm"
          renderIcon={Add}
          onClick={handleOpenModal}
        >
          {__('Add')}
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
      <Modal
        open={isModalOpen}
        modalHeading={editingIndex !== null ? __('Edit File Entry') : __('Add File Entry')}
        primaryButtonText={editingIndex !== null ? __('Update') : __('Add')}
        secondaryButtonText={__('Cancel')}
        onRequestSubmit={handleModalSubmit}
        onRequestClose={handleCloseModal}
        size="sm"
      >
        <div className="ap-modal-form" style={{ marginBottom: '1rem' }}>
          <TextInput
            id="fileName"
            labelText={__('File Name')}
            placeholder={__('Enter file path')}
            value={modalValues.fileName}
            onChange={(e) => {
              setModalValues({ ...modalValues, fileName: e.target.value });
              if (errors.fileName) {
                setErrors({ ...errors, fileName: '' });
              }
            }}
            invalid={!!errors.fileName}
            invalidText={errors.fileName}
            required
          />
          <Checkbox
            id="fileContent"
            labelText={__('Collect Contents?')}
            checked={modalValues.fileContent}
            onChange={(e) => setModalValues({ ...modalValues, fileContent: e.target.checked })}
            style={{ marginTop: '1rem' }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default FileTab;
