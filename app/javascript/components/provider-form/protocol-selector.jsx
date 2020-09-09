import React, { useEffect, useContext } from 'react';
import { get } from 'lodash';

import componentMapper from '../../forms/mappers/componentMapper';
import { useFormApi, useFieldApi, componentTypes } from '@@ddf';
import { EditingContext } from './index';

const Select = componentMapper[componentTypes.SELECT];

const filter = (items, toDelete) => Object.keys(items).filter(key => !toDelete.includes(key)).reduce((obj, key) => ({
  ...obj,
  [key]: items[key],
}), {});

// This is a special <Select> component that allows altering underlying endpoints/authentications which is intended to
// be used when there's a variety of protocols for a given implemented service. For example event stream collection in
// some providers allows the user to choose from multiple protocols.
const ProtocolSelector = ({ initialValue: defaultValue, options, ...props }) => {
  const formOptions = useFormApi();
  const { providerId } = useContext(EditingContext);

  // If editing an existing provider, we need to determine which endpoint protocol is being used.
  // This is done by checking against the pivot field for each option. If a related the pivot is
  // set, it means that the endpoint is used. If there is no pivot selected, we fall back to the
  // passed initialValue.
  const preSelected = !!providerId && options.find(({ pivot }) => get(formOptions.getState().values, pivot));
  const initialValue = preSelected ? preSelected.value : defaultValue;

  const { input: { value } } = useFieldApi({ options, initialValue, ...props });
  useEffect(() => {
    if (value) {
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
    }
  }, [value]);

  return <Select options={options} {...props} />;
};

export default ProtocolSelector;
