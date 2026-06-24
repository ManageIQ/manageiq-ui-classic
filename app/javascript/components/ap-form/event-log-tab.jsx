import { useState } from 'react';
import { useFieldApi, useFormApi } from '@@ddf';
import { TextInput, Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import MiqDataTable from '../miq-data-table';

const EventLogTab = (props) => {
  const {
    input: { value = [], name },
  } = useFieldApi(props);
  const formOptions = useFormApi();

  const [formData, setFormData] = useState({
    eventLogName: '',
    eventLogMessage: '',
    eventLogLevel: '',
    eventLogSource: '',
    eventLogNumDays: '',
    editingIndex: null,
  });

  const handleSubmit = () => {
    if (!formData.eventLogName.trim()) {
      add_flash(__('Event log name is required'), 'error');
      return;
    }

    const entryData = {
      name: formData.eventLogName,
      filter: {
        message: formData.eventLogMessage,
        level: formData.eventLogLevel,
        source: formData.eventLogSource,
        num_days: parseInt(formData.eventLogNumDays, 10) || 0,
      },
    };

    let newValue;
    if (formData.editingIndex !== null) {
      newValue = [...value];
      newValue[formData.editingIndex] = entryData;
    } else {
      newValue = [...value, entryData];
    }

    formOptions.change(name, newValue);
    setFormData({
      eventLogName: '',
      eventLogMessage: '',
      eventLogLevel: '',
      eventLogSource: '',
      eventLogNumDays: '',
      editingIndex: null,
    });
  };

  const handleEditClick = (index) => {
    const entry = value[index];
    setFormData({
      eventLogName: entry.name,
      eventLogMessage: entry.filter.message || '',
      eventLogLevel: entry.filter.level || '',
      eventLogSource: entry.filter.source || '',
      eventLogNumDays: entry.filter.num_days?.toString() || '',
      editingIndex: index,
    });
  };

  const handleCancel = () => {
    setFormData({
      eventLogName: '',
      eventLogMessage: '',
      eventLogLevel: '',
      eventLogSource: '',
      eventLogNumDays: '',
      editingIndex: null,
    });
  };

  const handleDelete = (index) => {
    const newValue = value.filter((_, i) => i !== index);
    formOptions.change(name, newValue);
    // Clear form if we were editing the deleted item
    if (formData.editingIndex === index) {
      setFormData({
        eventLogName: '',
        eventLogMessage: '',
        eventLogLevel: '',
        eventLogSource: '',
        eventLogNumDays: '',
        editingIndex: null,
      });
    }
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
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <TextInput
          id="eventlog-name"
          labelText={__('Name')}
          value={formData.eventLogName}
          onChange={(e) => setFormData({ ...formData, eventLogName: e.target.value })}
          placeholder={__('Enter event log name')}
        />
      </div>
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <TextInput
          id="eventlog-message"
          labelText={__('Filter Message')}
          value={formData.eventLogMessage}
          onChange={(e) => setFormData({ ...formData, eventLogMessage: e.target.value })}
          placeholder={__('Enter filter message')}
        />
      </div>
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <TextInput
          id="eventlog-level"
          labelText={__('Level')}
          value={formData.eventLogLevel}
          onChange={(e) => setFormData({ ...formData, eventLogLevel: e.target.value })}
          placeholder={__('Enter level')}
        />
      </div>
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <TextInput
          id="eventlog-source"
          labelText={__('Source')}
          value={formData.eventLogSource}
          onChange={(e) => setFormData({ ...formData, eventLogSource: e.target.value })}
          placeholder={__('Enter source')}
        />
      </div>
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <TextInput
          id="eventlog-numdays"
          labelText={__('# of Days')}
          value={formData.eventLogNumDays}
          onChange={(e) => setFormData({ ...formData, eventLogNumDays: e.target.value })}
          placeholder={__('Enter number of days')}
          type="number"
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
                const nameCell = selectedRow.cells?.find((c) => c.id.includes('name'));
                if (nameCell) {
                  const index = value.findIndex((e) => e.name === nameCell.value);
                  if (index !== -1) {
                    handleEditClick(index);
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
