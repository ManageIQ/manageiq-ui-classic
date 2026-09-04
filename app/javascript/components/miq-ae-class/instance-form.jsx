import { useState, useEffect, useRef } from 'react';
import {
  Button, TextInput, Modal, InlineNotification,
} from '@carbon/react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import InstanceFieldsTable from './instance-fields-table';
import { createFieldEditSchema } from './instance-form.schema';
import mapper from '../../forms/mappers/componentMapper';

const InstanceForm = ({ recordId = undefined, classId = undefined }) => {
  const [data, setData] = useState({
    isLoading: true,
    instance: { name: '', display_name: '', description: '' },
    fields: [],
    isStateClass: false,
    namespacePath: '',
  });

  const [initialData, setInitialData] = useState({
    instance: { name: '', display_name: '', description: '' },
    fields: [],
  });

  const [formValues, setFormValues] = useState({
    name: '',
    display_name: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalResetMessage, setModalResetMessage] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(null);
  const modalRef = useRef(null);

  const isEdit = !!recordId;

  useEffect(() => {
    miqSparkleOn();
    const url = isEdit
      ? `/miq_ae_class/instance_form_data/${recordId}`
      : `/miq_ae_class/instance_form_data/new?class_id=${classId}`;

    http.get(url)
      .then((response) => {
        // Fields now contain all data including values from the backend
        const instanceData = {
          isLoading: false,
          instance: response.instance,
          fields: response.fields,
          isStateClass: response.is_state_class,
          namespacePath: response.namespace_path,
        };

        setData(instanceData);

        // Store initial data for reset functionality
        setInitialData({
          instance: response.instance,
          fields: JSON.parse(JSON.stringify(response.fields)), // Deep copy
        });

        setFormValues({
          name: response.instance.name || '',
          display_name: response.instance.display_name || '',
          description: response.instance.description || '',
        });

        miqSparkleOff();
      })
      .catch((error) => {
        miqSparkleOff();
        const errorMessage = error.response?.data?.error || error.message || __('Error loading instance data');
        add_flash(errorMessage, 'error');
      });
  }, [recordId, classId, isEdit]);

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formValues.name || formValues.name.trim() === '') {
      newErrors.name = __('Name is required');
    } else if (!/^[a-zA-Z0-9_.-]*$/.test(formValues.name)) {
      newErrors.name = __('Name may contain only alphanumeric and _ . - characters');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    miqSparkleOn();

    // Transform the field values back to the format expected by the backend
    const PASSWORD_MASK = '********';
    const aeValues = data.fields.map((field) => {
      const isPasswordMasked = field.datatype === 'password' && field.value === PASSWORD_MASK;
      const fieldData = {
        value: isPasswordMasked ? null : (field.value || ''),
        collect: field.value_collect || '',
      };

      if (data.isStateClass && field.aetype === 'state') {
        fieldData.on_entry = field.value_on_entry || '';
        fieldData.on_exit = field.value_on_exit || '';
        fieldData.on_error = field.value_on_error || '';
        fieldData.max_retries = field.value_max_retries || '';
        fieldData.max_time = field.value_max_time || '';
      }

      return fieldData;
    });

    const params = {
      name: formValues.name,
      display_name: formValues.display_name,
      description: formValues.description,
      ae_values: aeValues,
    };

    const url = isEdit
      ? `/miq_ae_class/instance_update/${recordId}`
      : `/miq_ae_class/instance_create?class_id=${classId}`;

    http.post(url, params)
      .then(() => {
        const message = isEdit
          ? sprintf(__('Automate Instance "%s" was saved'), formValues.name)
          : sprintf(__('Automate Instance "%s" was added'), formValues.name);
        miqRedirectBack(message, 'success', '/miq_ae_class/explorer');
      })
      .catch((error) => {
        miqSparkleOff();
        const errorMessage = error.response?.data?.error || error.message || __('Error saving instance');
        add_flash(errorMessage, 'error');
      });
  };

  const onCancel = () => {
    const message = isEdit
      ? sprintf(__('Edit of Automate Instance "%s" was cancelled by the user'), formValues.name || data.instance.name)
      : __('Add of new Automate Instance was cancelled by the user');
    miqRedirectBack(message, 'warning', '/miq_ae_class/explorer');
  };

  const onReset = () => {
    // Reset form values to initial state
    setFormValues({
      name: initialData.instance.name || '',
      display_name: initialData.instance.display_name || '',
      description: initialData.instance.description || '',
    });

    // Reset fields to initial state
    setData((prev) => ({
      ...prev,
      fields: JSON.parse(JSON.stringify(initialData.fields)), // Deep copy
    }));

    setErrors({});

    add_flash(__('All changes have been reset'), 'warning');
  };

  const handleEditField = (field, index) => {
    setSelectedField(field);
    setSelectedFieldIndex(index);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalResetMessage(null);
    setSelectedField(null);
    setSelectedFieldIndex(null);
  };

  const handleFieldUpdate = (values) => {
    // Update the field in the data.fields array
    const updatedFields = [...data.fields];
    updatedFields[selectedFieldIndex] = {
      ...updatedFields[selectedFieldIndex],
      value: values.value,
      value_collect: values.collect,
      value_on_entry: values.on_entry || '',
      value_on_exit: values.on_exit || '',
      value_on_error: values.on_error || '',
      value_max_retries: values.max_retries || '',
      value_max_time: values.max_time || '',
    };

    setData((prev) => ({
      ...prev,
      fields: updatedFields,
    }));

    handleModalClose();
  };

  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      // Prevent close button from getting focus and showing tooltip
      const firstInput = modalRef.current.querySelector('input, textarea, select');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }, [isModalOpen]);

  const submitLabel = isEdit ? __('Save') : __('Add');

  const hasFormChanges = isEdit && initialData.instance && (
    formValues.name !== initialData.instance.name
    || formValues.display_name !== initialData.instance.display_name
    || formValues.description !== initialData.instance.description
  );

  const hasFieldChanges = isEdit && initialData.fields && initialData.fields.length > 0
    && JSON.stringify(data.fields) !== JSON.stringify(initialData.fields);

  const hasChanges = hasFormChanges || hasFieldChanges;

  if (data.isLoading) {
    return null;
  }

  return (
    <div className="dialog-provision-form">
      <form onSubmit={onSubmit}>
        <h3>{__('Main Info')}</h3>
        <div className="form-horizontal ae-main-info-section">
          <div className="form-group">
            <label htmlFor="namespace_path" className="col-md-2 control-label">{__('Fully Qualified Name')}</label>
            <div className="col-md-8">
              <TextInput
                id="namespace_path"
                value={data.namespacePath}
                readOnly
                labelText=""
                hideLabel
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name" className="col-md-2 control-label">{__('Name')}</label>
            <div className="col-md-8">
              <TextInput
                id="name"
                value={formValues.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                invalid={!!errors.name}
                invalidText={errors.name}
                maxLength={255}
                labelText=""
                hideLabel
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="display_name" className="col-md-2 control-label">{__('Display Name')}</label>
            <div className="col-md-8">
              <TextInput
                id="display_name"
                value={formValues.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                maxLength={255}
                labelText=""
                hideLabel
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="col-md-2 control-label">{__('Description')}</label>
            <div className="col-md-8">
              <TextInput
                id="description"
                value={formValues.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                maxLength={255}
                labelText=""
                hideLabel
              />
            </div>
          </div>
        </div>

        <hr />

        <h3>{__('Fields')}</h3>
        <InstanceFieldsTable
          fields={data.fields}
          isStateClass={data.isStateClass}
          onEditField={handleEditField}
        />

        <div className="custom-button-wrapper ae-form-button-wrapper">
          <Button
            disabled={!!errors.name || (!isEdit && !formValues.name) || (isEdit && !hasChanges)}
            kind="primary"
            className="btnRight"
            type="submit"
          >
            {submitLabel}
          </Button>
          {isEdit && (
            <Button
              disabled={!hasChanges}
              kind="secondary"
              className="btnRight"
              onClick={onReset}
              type="button"
            >
              {__('Reset')}
            </Button>
          )}
          <Button type="button" onClick={onCancel} kind="secondary">
            {__('Cancel')}
          </Button>
        </div>
      </form>

      <Modal
        ref={modalRef}
        open={isModalOpen}
        modalHeading={selectedField ? sprintf(__('Edit %s'), selectedField.display_name || selectedField.name) : __('Edit Field')}
        onRequestClose={handleModalClose}
        passiveModal
      >
        {selectedField && (
          <>
            {modalResetMessage && (
              <InlineNotification
                kind="warning"
                title={modalResetMessage}
                hideCloseButton={false}
                onClose={() => setModalResetMessage(null)}
                lowContrast
              />
            )}
            <MiqFormRenderer
              key={isModalOpen}
              schema={createFieldEditSchema(selectedField, data.isStateClass)}
              componentMapper={mapper}
              initialValues={{
                value: selectedField.value || '',
                collect: selectedField.value_collect || '',
                on_entry: selectedField.value_on_entry || '',
                on_exit: selectedField.value_on_exit || '',
                on_error: selectedField.value_on_error || '',
                max_retries: selectedField.value_max_retries || '',
                max_time: selectedField.value_max_time || '',
              }}
              onSubmit={handleFieldUpdate}
              onCancel={handleModalClose}
              canReset
              onReset={() => setModalResetMessage(__('All changes have been reset'))}
              buttonsLabels={{
                submitLabel: __('Update'),
              }}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

InstanceForm.propTypes = {
  recordId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default InstanceForm;
