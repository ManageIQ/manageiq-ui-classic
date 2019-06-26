import React, { useState, useEffect } from 'react';
import {
  ControlLabel,
  InputGroup,
  FormGroup,
  FormControl,
  HelpBlock,
} from 'patternfly-react';
import { rawComponents } from '@data-driven-forms/pf3-component-mapper';

import RequiredLabel from './required-label';

const DataDrivenInputWithPrefix = ({
  FieldProvider,
  prefixOptions,
  validate,
  prefixSeparator,
  ...rest
}) => {
  const [prefix, setPrefix] = useState();
  /**
   * get string prefix from initial value on after initial component mount
   */
  useEffect(() => {
    const value = rest.formOptions.getFieldState(rest.name);
    if (value.initial) {
      setPrefix(value.initial.substring(0, value.initial.indexOf(prefixSeparator) + prefixSeparator.length));
    }
  }, []);

  /**
   * create regular expression to strip the value of its prefix
   */
  const prefixMatcher = new RegExp(`.*${prefixSeparator}`);
  return (
    <FieldProvider
      {...rest}
      validate={(value) => {
        const implicitValidator = validate(value);
        const missingPrefix = value === prefix ? __('Required') : undefined;
        return implicitValidator || missingPrefix;
      }}
    >
      {({
        isRequired,
        label,
        input: { name, onChange, value },
        meta: { error },
      }) => (
        <FormGroup name={name} validationState={error && 'error'}>
          <div>
            <ControlLabel>
              {isRequired ? <RequiredLabel label={label} /> : label }
            </ControlLabel>
          </div>
          <div className="dynamic-prefix-input">
            <rawComponents.Select
              invalid={isRequired && !prefix}
              input={{
                onChange: (prefix) => {
                  onChange(`${prefix}${value.replace(prefixMatcher, '')}`);
                  setPrefix(prefix);
                },
                value: prefix,
              }}
              options={prefixOptions}
            />
            {prefix && (
            <InputGroup>
              <InputGroup.Addon>
                {prefix}
              </InputGroup.Addon>
              <FormControl
                onChange={({ target: { value } }) => onChange(`${prefix}${value}`)}
                value={value.replace(prefixMatcher, '')}
                name={name}
              />
            </InputGroup>
            )}
          </div>
          {error && <HelpBlock>{error}</HelpBlock>}
        </FormGroup>
      )}
    </FieldProvider>
  );
};

DataDrivenInputWithPrefix.defaultProps = {
  prefixSeparator: '://',
};


export default DataDrivenInputWithPrefix;
