import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Modal, ModalBody } from 'carbon-components-react';
import { dynamicComponents } from '../data';
import { createSchema } from './edit-field-modal.schema';
import InlineFlashMessage from '../../common/inline-flash-message';

const EditFieldModal = ({
  componentId, fieldConfiguration, showModal, onModalHide, onModalApply, initialData,
  onSave, onDynamicSwitchToggle, onCategorySelect, onTimePickerChange, onAutomationTypeChange,
}) => {
  const component = dynamicComponents.find((item) => item.id === componentId);

  const [formValues, setFormValues] = useState(initialData);
  const [inlineFlashMessage, setInlineFlashMessage] = useState(() => {
    if (component.title === 'Tag Control') {
      return ({
        kind: 'warning',
        subtitle: __('Category needs to be set for TagControl field'),
      });
    }
    return null;
  });

  const setCategories = (categoryValue) => {
    const selectedCategory = initialData.categories.find((cat) => cat.value === categoryValue);
    if (selectedCategory) {
      const subCat = selectedCategory.data.subCategories;
      setFormValues((prev) => ({
        ...prev,
        selectedCategory,
        subCategories: subCat,
      }));
      onCategorySelect(selectedCategory, subCat);
    }
  };

  const handleFieldUpdates = ({ target }) => {
    if (!target) return;

    const val = target.type === 'checkbox' ? target.checked : target.value;

    if (target.name === 'dynamic') {
      const isDynamic = val;
      onDynamicSwitchToggle(isDynamic);
      // Only show warning if dynamic is enabled and no entry point is set
      if (isDynamic && (!formValues.automateEntryPoint)) {
        setInlineFlashMessage({
          kind: 'warning',
          subtitle: __('Entry Point needs to be set for Dynamic elements'),
        });
      } else {
        setInlineFlashMessage(null);
      }
    } else if (target.name === 'categories') {
      setCategories(val);
    } else if (target.name === 'automationType') {
      onAutomationTypeChange(val);
    } else if (target.name === 'name' || target.name === 'label') {
      if (!val) {
        setInlineFlashMessage({
          kind: 'warning',
          subtitle: __('Label or Name is missing'),
        });
      }
    }
  };

  const onCancel = () => onModalHide();

  const handleSubmit = (submittedValues, e) => {
    const finalValues = { ...formValues, ...submittedValues };
    onSave(e, finalValues);
  };

  const onChange = (data) => {
    if (!data) return;

    if (data.initialData.label === 'Timepicker') {
      onTimePickerChange(data.value);
    } else if (data.initialData.label === 'Entry point') {
      // Update form values to make the form dirty when entry point changes
      setFormValues((prev) => ({ ...prev, automateEntryPoint: data.value }));

      // Clear warning message if entry point is selected
      if (data.value) {
        setInlineFlashMessage(null);
      } else if (formValues.dynamic) {
        // Show warning if entry point is removed and dynamic is enabled
        setInlineFlashMessage({
          kind: 'warning',
          subtitle: __('Entry Point needs to be set for Dynamic elements'),
        });
      }
    }
  };

  return (
    <Modal
      open
      modalHeading={__(`Edit this ${component.title}`)}
      onRequestClose={onModalHide}
      passiveModal // Required to hide the save and cancel buttons on the Modal
      className="edit-field-modal"
      onChange={handleFieldUpdates}
    >
      <ModalBody className="edit-field-modal-body">
        <InlineFlashMessage message={inlineFlashMessage} showCloseButton={false} />
        <MiqFormRenderer
          schema={createSchema(fieldConfiguration, formValues, onChange)}
          initialValues={formValues}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </ModalBody>
    </Modal>
  );
};

EditFieldModal.propTypes = {
  componentId: PropTypes.number.isRequired,
  fieldConfiguration: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.any),
  })).isRequired,
  showModal: PropTypes.bool.isRequired,
  onModalHide: PropTypes.func.isRequired,
  onModalApply: PropTypes.func.isRequired,
  initialData: PropTypes.objectOf(PropTypes.any).isRequired,
  onSave: PropTypes.func.isRequired,
  onDynamicSwitchToggle: PropTypes.func.isRequired,
  onCategorySelect: PropTypes.func.isRequired,
};

export default EditFieldModal;
