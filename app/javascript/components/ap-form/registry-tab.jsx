import { useState } from 'react';
import { useFieldApi, useFormApi } from '@@ddf';
import { TextInput, Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import MiqDataTable from '../miq-data-table';

const RegistryTab = (props) => {
  const {
    input: { value = [], name },
  } = useFieldApi(props);
  const formOptions = useFormApi();

  const [formData, setFormData] = useState({
    regKey: '',
    regValue: '',
    editingIndex: null,
  });

  const handleSubmit = () => {
    if (!formData.regKey.trim() || !formData.regValue.trim()) {
      add_flash(__('Registry Entry is required'), 'error');
      return;
    }

    const entryData = {
      depth: 0,
      hive: 'HKLM',
      key: formData.regKey,
      value: formData.regValue,
    };

    let newValue;
    if (formData.editingIndex !== null) {
      newValue = [...value];
      newValue[formData.editingIndex] = entryData;
    } else {
      newValue = [...value, entryData];
    }

    formOptions.change(name, newValue);
    setFormData({ regKey: '', regValue: '', editingIndex: null });
  };

  const handleEditClick = (index) => {
    const entry = value[index];
    setFormData({
      regKey: entry.key,
      regValue: entry.value,
      editingIndex: index,
    });
  };

  const handleCancel = () => {
    setFormData({ regKey: '', regValue: '', editingIndex: null });
  };

  const handleDelete = (index) => {
    const newValue = value.filter((_, i) => i !== index);
    formOptions.change(name, newValue);
    // Clear form if we were editing the deleted item
    if (formData.editingIndex === index) {
      setFormData({ regKey: '', regValue: '', editingIndex: null });
    }
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
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <TextInput
          id="reg-key"
          labelText={__('Registry Key')}
          value={formData.regKey}
          onChange={(e) => setFormData({ ...formData, regKey: e.target.value })}
          placeholder={__('Enter registry key')}
        />
      </div>
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <TextInput
          id="reg-value"
          labelText={__('Registry Value')}
          value={formData.regValue}
          onChange={(e) => setFormData({ ...formData, regValue: e.target.value })}
          placeholder={__('Enter registry value')}
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
    </div>
  );
};

export default RegistryTab;
