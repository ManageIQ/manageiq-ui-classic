import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { FilterableMultiSelect } from 'carbon-components-react';
import { fieldProperties } from '../../helper.field';
import FieldLabel from '../FieldLabel';
import ServiceValidator from '../../ServiceValidator';
import ServiceContext from '../../ServiceContext';

/** Component to render the MultiDropDownField in the Service/DialogTabs/DialogGroups/DialogFields component */
const MultiDropDownField = ({ field, options }) => {
  const { data, setData } = useContext(ServiceContext);
  const {
    fieldData, isDisabled, fieldId, requiredLabel,
  } = fieldProperties(field, data);

  /** FilterableMultiSelect onChange event handler */
  const onChange = ({ selectedItems }) => {
    if (data.isOrderServiceForm) {
      const { valid, value } = ServiceValidator.validateField({ value: selectedItems, field });
      data.dialogFields[field.name] = { ...data.dialogFields[field.name], value, valid };
      setData({
        ...data,
        dialogFields: { ...data.dialogFields },
        fieldsToRefresh: field.dialog_field_responders,
      });
    }
  };

  /** Custom sort function that does nothing to maintain the order of items. sorting is already handled in helper functions.
   * Or we han avoid the helper functions mad implement a logic here using the field.options.sort_order property. (easy way).
  */
  const noSort = (items) => items;

  return (
    <FilterableMultiSelect
      disabled={isDisabled}
      invalid={!fieldData.valid}
      id={fieldId}
      titleText={<FieldLabel field={field} />}
      initialSelectedItems={fieldData.value}
      placeholder={fieldData.value.length <= 0 ? __('Nothing selected') : ''}
      invalidText={requiredLabel}
      items={options.map((item) => ({ ...item, label: item.text }))}
      itemToString={(item) => (item ? item.text : '')}
      onChange={onChange}
      selectionFeedback="top-after-reopen"
      readOnly={field.read_only}
      sortItems={noSort}
    />
  );
};

MultiDropDownField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
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
