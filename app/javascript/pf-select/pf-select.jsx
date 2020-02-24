import React from 'react';
import PropTypes from 'prop-types';
import ReactSelect, { components } from 'react-select';
import { __ } from '../global-functions';
import customStyles from './select-styles';

const selectValue = (option, simpleValue) =>
  option.sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }))
    .map(item => (simpleValue ? item.value : item));

export const ValueContainer = ({ children, ...props }) => {
  if (props.isMulti) {
    return (
      <components.ValueContainer {...props}>
        <div className="pf3-select_multi-values-wrapper">
          { children[0] }
        </div>
        { children.slice(1) }
      </components.ValueContainer>
    );
  }

  return (
    <components.ValueContainer {...props}>
      { children }
    </components.ValueContainer>
  );
};

ValueContainer.propTypes = {
  isMulti: PropTypes.bool,
  children: PropTypes.any,
};

export const PfSelect = ({
  input,
  meta,
  simpleValue,
  ...rest
}) => (
  <ReactSelect
    className={`final-form-select ${meta.invalid ? 'has-error' : ''}`}
    styles={customStyles}
    {...input}
    {...rest}
        options={rest.options.filter(option => option.hasOwnProperty('value') && option.value !== null)} // eslint-disable-line
    value={simpleValue ? rest.options.filter(({ value }) => (rest.multi ? input.value.includes(value) : value === input.value)) : input.value}
    isMulti={rest.multi}
    isSearchable={!!rest.searchable}
    isClearable={!!rest.clearable}
    hideSelectedOptions={false}
    closeMenuOnSelect={!rest.multi}
    noOptionsMessage={() => __('No option found')}
    components={{
          ValueContainer,
        }}
    onChange={option => input.onChange(rest.multi
          ? selectValue(option, simpleValue)
          : option && (simpleValue ? option.value : option))}
  />
);

PfSelect.propTypes = {
  meta: PropTypes.object.isRequired,
  input: PropTypes.object.isRequired,
  simpleValue: PropTypes.bool,
};

PfSelect.defaultProps = {
  simpleValue: true,
};

export default PfSelect;
