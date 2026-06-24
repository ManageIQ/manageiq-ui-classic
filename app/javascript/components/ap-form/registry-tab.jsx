import { useState } from 'react';
import { useFieldApi, useFormApi } from '@@ddf';
import {
  Button, Modal, TextInput,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import MiqDataTable from '../miq-data-table';

const RegistryTab = (props) => {
  const {
    input: { value = [], name },
  } = useFieldApi(props);
  const formOptions = useFormApi();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalValues, setModalValues] = useState({ regKey: '', regValue: '' });
  const [editingIndex, setEditingIndex] = useState(null);
  const [errors, setErrors] = useState({});

  const handleOpenModal = () => {
    setModalValues({ regKey: '', regValue: '' });
    setEditingIndex(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalValues({ regKey: '', regValue: '' });
    setEditingIndex(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!modalValues.regKey || modalValues.regKey.trim() === '') {
      newErrors.regKey = __('Registry Key is required');
    }
    if (!modalValues.regValue || modalValues.regValue.trim() === '') {
      newErrors.regValue = __('Registry Value is required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleModalSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const entryData = {
      depth: 0,
      hive: 'HKLM',
      key: modalValues.regKey,
      value: modalValues.regValue,
    };

    let newValue;
    if (editingIndex !== null) {
      newValue = [...value];
      newValue[editingIndex] = entryData;
    } else {
      newValue = [...value, entryData];
    }

    formOptions.change(name, newValue);
    handleCloseModal();
  };

  const handleEditClick = (index) => {
    const entry = value[index];
    setModalValues({
      regKey: entry.key,
      regValue: entry.value,
    });
    setEditingIndex(index);
    setIsModalOpen(true);
  };

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
              const clickedCell = event?.target?.closest('td');
              if (clickedCell && !clickedCell.classList.contains('action-cell-holder')) {
                const keyCell = selectedRow.cells?.find((c) => c.id.includes('key'));
                const valueCell = selectedRow.cells?.find((c) => c.id.includes('value'));
                if (keyCell && valueCell) {
                  const index = value.findIndex((e) => e.key === keyCell.value && e.value === valueCell.value);
                  if (index !== -1) {
                    handleEditClick(index);
                  }
                }
              }
            }
          }}
          mode="ap-form-registry"
        />
      )}
      <Modal
        open={isModalOpen}
        modalHeading={editingIndex !== null ? __('Edit Registry Entry') : __('Add Registry Entry')}
        primaryButtonText={editingIndex !== null ? __('Update') : __('Add')}
        secondaryButtonText={__('Cancel')}
        onRequestSubmit={handleModalSubmit}
        onRequestClose={handleCloseModal}
        size="sm"
      >
        <div className="ap-modal-form" style={{ marginBottom: '1rem' }}>
          <TextInput
            id="regKey"
            labelText={__('Registry Key')}
            placeholder={__('Enter registry key')}
            value={modalValues.regKey}
            onChange={(e) => {
              setModalValues({ ...modalValues, regKey: e.target.value });
              if (errors.regKey) {
                setErrors({ ...errors, regKey: '' });
              }
            }}
            invalid={!!errors.regKey}
            invalidText={errors.regKey}
            required
            style={{ marginBottom: '1rem' }}
          />
          <TextInput
            id="regValue"
            labelText={__('Registry Value')}
            placeholder={__('Enter registry value')}
            value={modalValues.regValue}
            onChange={(e) => {
              setModalValues({ ...modalValues, regValue: e.target.value });
              if (errors.regValue) {
                setErrors({ ...errors, regValue: '' });
              }
            }}
            invalid={!!errors.regValue}
            invalidText={errors.regValue}
            required
          />
        </div>
      </Modal>
    </div>
  );
};

export default RegistryTab;
