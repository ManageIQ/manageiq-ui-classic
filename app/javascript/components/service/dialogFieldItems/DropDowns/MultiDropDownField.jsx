import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { FilterableMultiSelect } from 'carbon-components-react';
import { requiredLabel, fieldComponentId } from '../../helper';
import FieldLabel from '../FieldLabel';
import ServiceValidator from '../../ServiceValidator';
import ServiceContext from '../../ServiceContext';

/** Component to render the MultiDropDownField in the Service/DialogTabs/DialogGroups/DialogFields component */
const MultiDropDownField = ({ field, options }) => {
  const { data, setData } = useContext(ServiceContext);
  const fieldData = data.dialogFields[field.name];

  const onChange = ({ selectedItems }) => {
    if (data.isOrderServiceForm) {
      const { valid, value } = ServiceValidator.validateField({ value: selectedItems, field, isOrderServiceForm: data.isOrderServiceForm });
      data.dialogFields[field.name] = { value, valid };
      setData({
        ...data,
        dialogFields: { ...data.dialogFields },
        fieldsToRefresh: field.dialog_field_responders,
      });
    }
  };

  return (
    <FilterableMultiSelect
      disabled={!!data.fieldsToRefresh.length > 0}
      invalid={!fieldData.valid}
      id={fieldComponentId(field)}
      titleText={<FieldLabel field={field} />}
      initialSelectedItems={fieldData.value}
      placeholder={fieldData.value.length <= 0 ? __('Nothing selected') : ''}
      invalidText={requiredLabel(field.required)}
      items={options.map((item) => ({ ...item, label: item.text }))}
      itemToString={(item) => (item ? item.text : '')}
      onChange={onChange}
      selectionFeedback="top-after-reopen"
      readOnly={field.read_only}
    />
  );
};

MultiDropDownField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    dialog_field_responders: PropTypes.arrayOf(PropTypes.string),
    label: PropTypes.string.isRequired,
    required: PropTypes.bool,
    read_only: PropTypes.bool,
  }).isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    text: PropTypes.string.isRequired,
    label: PropTypes.string,
  })).isRequired,
};

export default MultiDropDownField;
