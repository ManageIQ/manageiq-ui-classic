import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, TextArea } from 'carbon-components-react';
import { DynamicReactComponents, InputTypes } from './helpers';

const MiqStructuredListInputs = ({ value }) => {
  const renderTextArea = (value) => (<TextArea value={value.text} labelText="" />);

  const renderCheckbox = ({
    label, name, checked, disabled,
  }) => (
    <Checkbox
      labelText={label}
      id={name}
      checked={checked}
      disabled={disabled || false}
    />
  );

  const renderDynamicComponent = (value) => {
    const DynamicComponent = DynamicReactComponents[`${value.component}`];
    return (<DynamicComponent {...value.props} />);
  };

  switch (value.input) {
    case InputTypes.TEXTAREA:
      return renderTextArea(value);
    case InputTypes.CHECKBOX:
      return renderCheckbox(value);
    case InputTypes.COMPONENT:
      return renderDynamicComponent(value);
    default:
      return null;
  }
};

export default MiqStructuredListInputs;

const stringProps = {
  text: PropTypes.string,
};

const checkboxProps = {
  label: PropTypes.string,
  name: PropTypes.string,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
};

const dynamicProps = { props: PropTypes.shape(PropTypes.any) };

MiqStructuredListInputs.propTypes = {
  value: PropTypes.shape(stringProps || checkboxProps || dynamicProps).isRequired,
};
