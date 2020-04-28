import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import { components } from '@data-driven-forms/pf3-component-mapper';
import { EditingContext } from './index';

const filter = (items, toDelete) => Object.keys(items).filter(key => !toDelete.includes(key)).reduce((obj, key) => ({
  ...obj,
  [key]: items[key],
}), {});

// This is a special <Select> component that allows altering underlying endpoints/authentications which is intended to
// be used when there's a variety of protocols for a given implemented service. For example event stream collection in
// some providers allows the user to choose from multiple protocols.
const ProtocolSelector = ({
  FieldProvider, formOptions, initialValue, ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const { providerId } = useContext(EditingContext);

  return (
    <FieldProvider
      formOptions={formOptions}
      render={({ input: { name, onChange, ...input }, options, ...rest }) => {
        const fieldState = formOptions.getFieldState(name);

        // Run this on the first render with a usable state
        if (!loaded && fieldState) {
          // If editing an existing provider, we need to determine which endpoint protocol is being used.
          // This is done by checking against the pivot field for each option. If a related the pivot is
          // set, it means that the endpoint is used. If there is no pivot selected, we fall back to the
          // defined initialValue.
          if (!!providerId) {
            const selected = options.find(({ pivot }) => _.get(formOptions.getState().values, pivot));
            const value = selected ? selected.value : initialValue;

            // Reinitializing the form with the correct value for the select
            setTimeout(() => {
              formOptions.initialize({
                ...formOptions.getState().values,
                [name]: value,
              });
            });
          }

          setLoaded(true);
        }

        const enhancedChange = onChange => (value) => {
          setTimeout(() => {
            // Load the initial and current values for the endpoints/authentications after the field value has been changed
            const {
              initialValues: {
                endpoints: initialEndpoints = {},
                authentications: initialAuthentications = {},
              },
              values: {
                endpoints: currentEndpoints = {},
                authentications: currentAuthentications = {},
              },
            } = formOptions.getState();

            // Map the values of all possible options into an array
            const optionValues = options.map(({ value }) => value);
            // Determine which endpoint/authentication pair has to be removed from the form state
            const toDelete = optionValues.filter(option => option !== value);

            // Adjust the endpoints/authentications and pass them to the form state
            formOptions.change('endpoints', {
              ...filter(initialEndpoints, toDelete),
              ...filter(currentEndpoints, optionValues),
            });
            formOptions.change('authentications', {
              ...filter(initialAuthentications, toDelete),
              ...filter(currentAuthentications, optionValues),
            });
          });

          return onChange(value);
        };

        return <components.SelectField input={{ name, ...input, onChange: enhancedChange(onChange) }} options={options} {...rest} />;
      }}
      {...props}
    />
  );
};

ProtocolSelector.propTypes = {
  FieldProvider: PropTypes.func.isRequired,
};

export default ProtocolSelector;
