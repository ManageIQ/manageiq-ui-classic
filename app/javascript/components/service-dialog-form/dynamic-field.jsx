import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { API } from '../../http_api';
import { getComponentIdFromType } from './helper';
import DynamicFieldActions from './dynamic-field-actions';
import EditFieldModal from './edit-field-modal';

import DynamicTextInput from './dynamic-fields/dynamic-text-input';
import DynamicTextArea from './dynamic-fields/dynamic-text-area';
import DynamicCheckBox from './dynamic-fields/dynamic-checkbox';
import DynamicDropdown from './dynamic-fields/dynamic-dropdown';
import DynamicRadioButton from './dynamic-fields/dynamic-radio-button';
import DynamicDatePicker from './dynamic-fields/dynamic-date-picker';
import DynamicTimePicker from './dynamic-fields/dynamic-time-picker';
import DynamicTagControl from './dynamic-fields/dynamic-tag-control';

const FIELD_COMPONENTS = {
  'text-box': DynamicTextInput,
  'text-area': DynamicTextArea,
  'check-box': DynamicCheckBox,
  dropdown: DynamicDropdown,
  'radio-button': DynamicRadioButton,
  'date-picker': DynamicDatePicker,
  'time-picker': DynamicTimePicker,
  'tag-control': DynamicTagControl,
};

/**
 * Routes a dialog_field to the correct display widget by type.
 * Wraps it with DynamicFieldActions (edit + remove buttons shown on hover).
 * When Edit is clicked, opens EditFieldModal (Sub-Task 4).
 */
const DynamicField = ({
  field,
  fieldIndex,
  tabIndex,
  sectionIndex,
  onAction,
  emsWorkflowsEnabled = false,
  dialogData,
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch categories once when this field is a TagControl.
  // Other field types never need this data.
  useEffect(() => {
    if (field.type !== 'DialogFieldTagControl') return;
    API.get('/api/categories?expand=resources&attributes=id,name,description,single_value,children')
      .then((response) => setCategories(response.resources || []))
      .catch(() => {});
  }, [field.type]);

  const componentId = getComponentIdFromType(field.type);
  const FieldComponent = FIELD_COMPONENTS[componentId] || DynamicTextInput;

  const handleEditField = () => setEditModalOpen(true);
  const handleCloseModal = () => setEditModalOpen(false);

  const handleSaveField = (updatedValues) => {
    onAction('field.edit', { fieldName: field.name, values: updatedValues });
    setEditModalOpen(false);
  };

  return (
    <>
      <div
        className={`dynamic-field dynamic-field--${componentId}`}
        // _version on the field object triggers re-render when field is edited
        key={`${field.name}-${field._version || 1}`}
      >
        <div className="dynamic-field__widget">
          <FieldComponent field={field} />
        </div>
        <DynamicFieldActions
          tabIndex={tabIndex}
          sectionIndex={sectionIndex}
          fieldIndex={fieldIndex}
          field={field}
          onAction={onAction}
          onEditField={handleEditField}
        />
      </div>

      {editModalOpen && (
        <EditFieldModal
          isOpen={editModalOpen}
          field={field}
          dialogData={dialogData}
          emsWorkflowsEnabled={emsWorkflowsEnabled}
          categories={categories}
          onSave={handleSaveField}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

DynamicField.propTypes = {
  field: PropTypes.object.isRequired,
  fieldIndex: PropTypes.number.isRequired,
  tabIndex: PropTypes.number.isRequired,
  sectionIndex: PropTypes.number.isRequired,
  onAction: PropTypes.func.isRequired,
  emsWorkflowsEnabled: PropTypes.bool,
  dialogData: PropTypes.object,
};

export default DynamicField;
