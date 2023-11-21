import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'carbon-components-react';
import { requiredLabel, fieldComponentId } from '../../helper';
import FieldLabel from '../FieldLabel';
import ServiceContext from '../../ServiceContext';
import ServiceValidator from '../../ServiceValidator';

/** Component to render the SimpleDropDownField in the Service/DialogTabs/DialogGroups/DialogFields component */
const SimpleDropDownField = ({ field, options }) => {
  const { data, setData } = useContext(ServiceContext);
  const fieldData = data.dialogFields[field.name];

  const onChange = ({ selectedItem }) => {
    const { valid, value } = ServiceValidator.validateField({ value: selectedItem, field, isOrderServiceForm: data.isOrderServiceForm });
    data.dialogFields[field.name] = { value, valid };
    if (data.isOrderServiceForm) {
      setData({
        ...data,
        dialogFields: { ...data.dialogFields },
        fieldsToRefresh: field.dialog_field_responders,
      });
    } else {
      setData({
        ...data,
        dialogFields: { ...data.dialogFields },
      });
    }
  };

  return (
    <Dropdown
      disabled={!!data.fieldsToRefresh.length > 0}
      invalid={!fieldData.valid}
      id={fieldComponentId(field)}
      titleText={<FieldLabel field={field} />}
      initialSelectedItem={options[0]}
      selectedItem={fieldData.value}
      invalidText={requiredLabel(field.required)}
      label={__('Nothing selected')}
      items={options}
      itemToString={(item) => (item ? item.text : '')}
      onChange={onChange}
      readOnly={field.read_only}
    />
  );
};

SimpleDropDownField.propTypes = {
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
  })).isRequired,
};

export default SimpleDropDownField;
