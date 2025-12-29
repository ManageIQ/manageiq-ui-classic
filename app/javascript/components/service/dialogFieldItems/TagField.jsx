import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import MultiDropDownField from './DropDowns/MultiDropDownField';
import SimpleDropDownField from './DropDowns/SimpleDropDownField';
import ServiceContext from '../ServiceContext';
import { defaultFieldOptions } from '../helper';

/** Component to render the TagField in the Service/DialogTabs/DialogGroups/DialogFields component */
const TagField = ({ field }) => {
  const { data } = useContext(ServiceContext);
  const isMulti = !!(field.options && !field.options.force_single_value);
  const options = defaultFieldOptions(field, data);
  return isMulti
    ? <MultiDropDownField field={field} options={options} />
    : <SimpleDropDownField field={field} options={options} />;
};

TagField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string,
    options: PropTypes.shape({
      force_multi_value: PropTypes.bool,
      force_single_value: PropTypes.bool,
    }),
    default_value: PropTypes.string,
    label: PropTypes.string.isRequired,
    name: PropTypes.string,
    type: PropTypes.string,
    values: PropTypes.arrayOf(PropTypes.any),
    required: PropTypes.bool,
  }).isRequired,
};

export default TagField;
