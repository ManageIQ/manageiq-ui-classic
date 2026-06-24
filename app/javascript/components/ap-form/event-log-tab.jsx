import { useState } from 'react';
import { useFieldApi, useFormApi } from '@@ddf';
import {
  Button, Modal, TextInput, NumberInput,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import MiqDataTable from '../miq-data-table';

const EventLogTab = (props) => {
  const {
    input: { value = [], name },
  } = useFieldApi(props);
  const formOptions = useFormApi();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalValues, setModalValues] = useState({
    eventLogName: '',
    eventLogMessage: '',
    eventLogLevel: '',
    eventLogSource: '',
    eventLogNumDays: '',
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [errors, setErrors] = useState({});

  const handleOpenModal = () => {
    setModalValues({
      eventLogName: '',
      eventLogMessage: '',
      eventLogLevel: '',
      eventLogSource: '',
      eventLogNumDays: '',
    });
    setEditingIndex(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalValues({
      eventLogName: '',
      eventLogMessage: '',
      eventLogLevel: '',
      eventLogSource: '',
      eventLogNumDays: '',
    });
    setEditingIndex(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!modalValues.eventLogName || modalValues.eventLogName.trim() === '') {
      newErrors.eventLogName = __('Event log name is required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleModalSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const entryData = {
      name: modalValues.eventLogName,
      filter: {
        message: modalValues.eventLogMessage || '',
        level: modalValues.eventLogLevel || '',
        source: modalValues.eventLogSource || '',
        num_days: parseInt(modalValues.eventLogNumDays, 10) || 0,
      },
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
      eventLogName: entry.name,
      eventLogMessage: entry.filter.message || '',
      eventLogLevel: entry.filter.level || '',
      eventLogSource: entry.filter.source || '',
      eventLogNumDays: entry.filter.num_days?.toString() || '',
    });
    setEditingIndex(index);
    setIsModalOpen(true);
  };

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
      <Modal
        open={isModalOpen}
        modalHeading={editingIndex !== null ? __('Edit Event Log Entry') : __('Add Event Log Entry')}
        primaryButtonText={editingIndex !== null ? __('Update') : __('Add')}
        secondaryButtonText={__('Cancel')}
        onRequestSubmit={handleModalSubmit}
        onRequestClose={handleCloseModal}
        size="sm"
      >
        <div className="ap-modal-form" style={{ marginBottom: '1rem' }}>
          <TextInput
            id="eventLogName"
            labelText={__('Name')}
            placeholder={__('Enter event log name')}
            value={modalValues.eventLogName}
            onChange={(e) => {
              setModalValues({ ...modalValues, eventLogName: e.target.value });
              if (errors.eventLogName) {
                setErrors({ ...errors, eventLogName: '' });
              }
            }}
            invalid={!!errors.eventLogName}
            invalidText={errors.eventLogName}
            required
            style={{ marginBottom: '1rem' }}
          />
          <TextInput
            id="eventLogMessage"
            labelText={__('Filter Message')}
            placeholder={__('Enter filter message')}
            value={modalValues.eventLogMessage}
            onChange={(e) => setModalValues({ ...modalValues, eventLogMessage: e.target.value })}
            style={{ marginBottom: '1rem' }}
          />
          <TextInput
            id="eventLogLevel"
            labelText={__('Level')}
            placeholder={__('Enter level')}
            value={modalValues.eventLogLevel}
            onChange={(e) => setModalValues({ ...modalValues, eventLogLevel: e.target.value })}
            style={{ marginBottom: '1rem' }}
          />
          <TextInput
            id="eventLogSource"
            labelText={__('Source')}
            placeholder={__('Enter source')}
            value={modalValues.eventLogSource}
            onChange={(e) => setModalValues({ ...modalValues, eventLogSource: e.target.value })}
            style={{ marginBottom: '1rem' }}
          />
          <NumberInput
            id="eventLogNumDays"
            label={__('# of Days')}
            placeholder={__('Enter number of days')}
            value={modalValues.eventLogNumDays}
            onChange={(e) => setModalValues({ ...modalValues, eventLogNumDays: e.target.value })}
            min={0}
          />
        </div>
      </Modal>
    </div>
  );
};

export default EventLogTab;
