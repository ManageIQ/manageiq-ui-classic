import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { InlineNotification, Loading, Modal } from '@carbon/react';
import createSchema from './ap-form.schema';
import {
  createFileModalSchema,
  createRegistryModalSchema,
  createEventLogModalSchema,
} from './modal-schemas';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const MODAL_NONE = null;

const ApForm = ({
  scanId, scanMode, initialData, copy,
}) => {
  const [{ isLoading, formInitialValues }, setState] = useState({
    isLoading: true,
    formInitialValues: {},
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flashError, setFlashError] = useState(null);

  // modal state: { type: 'file'|'registry'|'eventLog', editingIndex: number|null, initialValues: {} }
  const [modal, setModal] = useState(MODAL_NONE);

  // ref to the outer form's field-change API (used to update DDF field values from modal submits)
  const formApiRef = useRef(null);

  const isNewRecord = !scanId || scanId === 'new';
  const isCopy = Boolean(copy);

  useEffect(() => {
    const determinedMode = isNewRecord ? (scanMode || 'Vm') : (initialData?.scan_mode || scanMode || 'Vm');

    const categoryData = initialData?.category || {};
    const categoryValues = {};
    if (categoryData.system) {
      categoryValues.system = true;
    }
    if (categoryData.services) {
      categoryValues.services = true;
    }
    if (categoryData.software) {
      categoryValues.software = true;
    }
    if (categoryData.accounts) {
      categoryValues.accounts = true;
    }
    if (categoryData.vmconfig) {
      categoryValues.vmconfig = true;
    }

    setState({
      isLoading: false,
      formInitialValues: {
        name: initialData?.name || '',
        description: initialData?.description || '',
        scan_mode: determinedMode,
        category: categoryValues,
        file_names: initialData?.file_names || [],
        reg_entries: initialData?.reg_entries || [],
        nteventlog_entries: initialData?.nteventlog_entries || [],
      },
    });
  }, [initialData, scanMode, isNewRecord, isCopy]);

  const closeModal = () => setModal(MODAL_NONE);

  // ── file modal callbacks ──────────────────────────────────────────────────
  const fileCallbacks = {
    onOpenModal: () => setModal({ type: 'file', editingIndex: null, initialValues: {} }),
    onEditClick: (index, entry) => setModal({
      type: 'file',
      editingIndex: index,
      initialValues: { fileName: entry.target, fileContent: entry.content || false },
    }),
  };

  const onFileModalSubmit = (values) => {
    const fileData = { target: values.fileName, content: values.fileContent || false };
    const current = formApiRef.current.getState().values.file_names || [];
    const updated = modal.editingIndex !== null
      ? current.map((item, i) => (i === modal.editingIndex ? fileData : item))
      : [...current, fileData];
    formApiRef.current.change('file_names', updated);
    closeModal();
  };

  // ── registry modal callbacks ──────────────────────────────────────────────
  const registryCallbacks = {
    onOpenModal: () => setModal({ type: 'registry', editingIndex: null, initialValues: {} }),
    onEditClick: (index, entry) => setModal({
      type: 'registry',
      editingIndex: index,
      initialValues: { regKey: entry.key, regValue: entry.value },
    }),
  };

  const onRegistryModalSubmit = (values) => {
    const entryData = {
      depth: 0, hive: 'HKLM', key: values.regKey, value: values.regValue,
    };
    const current = formApiRef.current.getState().values.reg_entries || [];
    const updated = modal.editingIndex !== null
      ? current.map((item, i) => (i === modal.editingIndex ? entryData : item))
      : [...current, entryData];
    formApiRef.current.change('reg_entries', updated);
    closeModal();
  };

  // ── event log modal callbacks ─────────────────────────────────────────────
  const eventLogCallbacks = {
    onOpenModal: () => setModal({ type: 'eventLog', editingIndex: null, initialValues: { eventLogNumDays: 0 } }),
    onEditClick: (index, entry) => setModal({
      type: 'eventLog',
      editingIndex: index,
      initialValues: {
        eventLogName: entry.name,
        eventLogMessage: entry.filter?.message || '',
        eventLogLevel: entry.filter?.level || '',
        eventLogSource: entry.filter?.source || '',
        eventLogNumDays: entry.filter?.num_days?.toString() || '',
      },
    }),
  };

  const onEventLogModalSubmit = (values) => {
    const entryData = {
      name: values.eventLogName,
      filter: {
        message: values.eventLogMessage || '',
        level: values.eventLogLevel || '',
        source: values.eventLogSource || '',
        num_days: parseInt(values.eventLogNumDays, 10) || 0,
      },
    };
    const current = formApiRef.current.getState().values.nteventlog_entries || [];
    const updated = modal.editingIndex !== null
      ? current.map((item, i) => (i === modal.editingIndex ? entryData : item))
      : [...current, entryData];
    formApiRef.current.change('nteventlog_entries', updated);
    closeModal();
  };

  const onSubmit = (values) => {
    if (isSubmitting) return;
    setFlashError(null);

    const isHostMode = values.scan_mode === 'Host';
    const categoryObj = values.category || {};
    const categorySelections = Object.keys(categoryObj).filter((key) => categoryObj[key]);

    const hasContent = (!isHostMode && categorySelections.length > 0)
      || (values.file_names && values.file_names.length > 0)
      || (!isHostMode && values.reg_entries && values.reg_entries.length > 0)
      || (values.nteventlog_entries && values.nteventlog_entries.length > 0);

    if (!hasContent) {
      setFlashError(__('At least one item must be entered to create Analysis Profile'));
      return;
    }

    const formData = {
      name: values.name,
      description: values.description,
      scan_mode: values.scan_mode,
      category: isHostMode ? [] : categorySelections,
      file: values.file_names || [],
      registry: isHostMode ? [] : (values.reg_entries || []),
      nteventlog: values.nteventlog_entries || [],
    };

    setIsSubmitting(true);
    const url = `/ops/ap_edit?id=${scanId || 'new'}&button=${isNewRecord ? 'add' : 'save'}`;
    http.post(url, { form_data: JSON.stringify(formData) })
      .then((response) => {
        if (response.data && response.data.error) {
          setIsSubmitting(false);
          setFlashError(response.data.error);
        } else {
          const message = response.data?.message || __('Analysis Profile was saved');
          miqRedirectBack(message, 'success', '/ops/explorer');
        }
      })
      .catch((error) => {
        setIsSubmitting(false);
        setFlashError(error.response?.data?.error || error.message || __('An error occurred while saving'));
      });
  };

  const onCancel = () => {
    let message;
    if (isCopy) {
      message = __('Copy of Analysis Profile was cancelled by the user');
    } else if (isNewRecord) {
      message = __('Add of new Analysis Profile was cancelled by the user');
    } else {
      message = __('Edit of Analysis Profile was cancelled by the user');
    }
    miqRedirectBack(message, 'warning', '/ops/explorer');
  };

  if (isLoading) {
    return <Loading active withOverlay={false} />;
  }

  const isHostMode = formInitialValues.scan_mode === 'Host';

  return (
    <div className="ap-form">
      {flashError && (
        <InlineNotification
          kind="error"
          role="alert"
          title={flashError}
          lowContrast
          onCloseButtonClick={() => setFlashError(null)}
        />
      )}
      <MiqFormRenderer
        schema={createSchema(isHostMode, { file: fileCallbacks, registry: registryCallbacks, eventLog: eventLogCallbacks })}
        initialValues={formInitialValues}
        initialize={(formOptions) => {
          formApiRef.current = formOptions;
        }}
        onSubmit={onSubmit}
        onCancel={onCancel}
        canReset={!isNewRecord && !isCopy}
        disableSubmit={isSubmitting ? ['submitting'] : ['invalid']}
        buttonsLabels={{
          submitLabel: (isNewRecord || isCopy) ? __('Add') : __('Save'),
        }}
      />

      {/* File modal — sibling of outer MiqFormRenderer, not nested inside it */}
      <Modal
        open={modal?.type === 'file'}
        modalHeading={modal?.editingIndex !== null ? __('Edit File Entry') : __('Add File Entry')}
        onRequestClose={closeModal}
        passiveModal
      >
        <MiqFormRenderer
          key={`file-${modal?.editingIndex}`}
          schema={createFileModalSchema()}
          initialValues={modal?.initialValues || {}}
          onSubmit={onFileModalSubmit}
          onCancel={closeModal}
          buttonsLabels={{ submitLabel: modal?.editingIndex !== null ? __('Update') : __('Add') }}
        />
      </Modal>

      {/* Registry modal */}
      <Modal
        open={modal?.type === 'registry'}
        modalHeading={modal?.editingIndex !== null ? __('Edit Registry Entry') : __('Add Registry Entry')}
        onRequestClose={closeModal}
        passiveModal
      >
        <MiqFormRenderer
          key={`registry-${modal?.editingIndex}`}
          schema={createRegistryModalSchema()}
          initialValues={modal?.initialValues || {}}
          onSubmit={onRegistryModalSubmit}
          onCancel={closeModal}
          buttonsLabels={{ submitLabel: modal?.editingIndex !== null ? __('Update') : __('Add') }}
        />
      </Modal>

      {/* Event Log modal */}
      <Modal
        open={modal?.type === 'eventLog'}
        modalHeading={modal?.editingIndex !== null ? __('Edit Event Log Entry') : __('Add Event Log Entry')}
        onRequestClose={closeModal}
        passiveModal
      >
        <MiqFormRenderer
          key={`eventLog-${modal?.editingIndex}`}
          schema={createEventLogModalSchema()}
          initialValues={modal?.initialValues || {}}
          onSubmit={onEventLogModalSubmit}
          onCancel={closeModal}
          buttonsLabels={{ submitLabel: modal?.editingIndex !== null ? __('Update') : __('Add') }}
        />
      </Modal>
    </div>
  );
};

ApForm.propTypes = {
  scanId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  scanMode: PropTypes.string,
  copy: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  initialData: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    scan_mode: PropTypes.string,
    category: PropTypes.objectOf(PropTypes.bool),
    file_names: PropTypes.arrayOf(PropTypes.shape({
      target: PropTypes.string,
      content: PropTypes.bool,
    })),
    reg_entries: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
    })),
    nteventlog_entries: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      filter: PropTypes.shape({
        message: PropTypes.string,
        level: PropTypes.string,
        source: PropTypes.string,
        num_days: PropTypes.number,
      }),
    })),
  }),
};

ApForm.defaultProps = {
  scanId: 'new',
  scanMode: 'Vm',
  copy: false,
  initialData: null,
};

export default ApForm;
