import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, TextArea, Dropdown } from 'carbon-components-react';
import { DynamicReactComponents, InputTypes } from '../../helpers';

/** Component to render textarea / checkbox / react components */
const MiqStructuredListInputs = ({ value, action }) => {
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

  const renderDropDownComponent = ({ props: { label, selectedItem, items } }) => (
    <Dropdown
      className="miq-structured-list-dropdown"
      id="miq-structured-list-dropdown"
      label={label}
      selectedItem={selectedItem}
      onChange={(changedItem) => action(changedItem)}
      items={items}
    />
  );

  switch (value.input) {
    case InputTypes.TEXTAREA:
      return renderTextArea(value);
    case InputTypes.CHECKBOX:
      return renderCheckbox(value);
    case InputTypes.COMPONENT:
      return renderDynamicComponent(value);
    case InputTypes.DROPDOWN:
      return renderDropDownComponent(value);
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

const dropDownProps = {
  component: PropTypes.string,
  input: PropTypes.string,
  props: PropTypes.shape({
    action: PropTypes.string,
    label: PropTypes.string,
    selectedItem: PropTypes.string,
    items: PropTypes.arrayOf({
      label: PropTypes.string,
      value: PropTypes.string,
      key: PropTypes.string,
    }),
  }),
};

const dynamicProps = { props: PropTypes.shape(PropTypes.any) };

MiqStructuredListInputs.propTypes = {
  value: PropTypes.shape(stringProps || checkboxProps || dynamicProps || dropDownProps).isRequired,
  action: PropTypes.func,
};

MiqStructuredListInputs.defaultProps = {
  action: undefined,
};
