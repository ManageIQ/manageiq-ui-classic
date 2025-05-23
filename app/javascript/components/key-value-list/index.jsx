import React from 'react';
import { useFieldApi, useFormApi } from '@@ddf';
import { Button, TextInput } from 'carbon-components-react';
import { TrashCan32 } from '@carbon/icons-react';

/** component used as a mapper to include the key value pairs ofr extra vars */
const KeyValueListComponent = (props) => {
  const {
    input, label, keyLabel, valueLabel,
  } = useFieldApi(props);
  const formOptions = useFormApi();

  const addPair = () => {
    const newPairs = [...input.value, { key: '', value: '' }];
    formOptions.change(input.name, newPairs);
  };

  const deletePair = (index) => {
    const newPairs = [...input.value];
    newPairs.splice(index, 1);
    formOptions.change(input.name, newPairs);
  };

  const updatePair = (index, key, value) => {
    const newPairs = [...input.value];
    newPairs[index] = { key, value };
    formOptions.change(input.name, newPairs);
  };

  return (
    <div className="key-value-list-component-wrapper">
      <label htmlFor={input.name} className="bx--label">{label}</label>
      <br />
      {input.value && input.value.map((pair, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className="key-value-list-pair">
          <TextInput
            id={`${input.name}.${index}.key`}
            labelText={keyLabel}
            value={pair.key}
            onChange={(event) => updatePair(index, event.target.value, pair.value)}
          />
          <TextInput
            id={`${input.name}.${index}.value`}
            labelText={valueLabel}
            value={pair.value}
            onChange={(event) => updatePair(index, pair.key, event.target.value)}
          />
          <Button
            hasIconOnly
            kind="danger"
            className="key-value-delete"
            renderIcon={TrashCan32}
            iconDescription="Delete Key-Value Pair"
            onClick={() => deletePair(index)}
          />
        </div>
      ))}
      <Button kind="secondary" onClick={addPair}>{__('Add Key-Value Pair')}</Button>
    </div>
  );
};

export default KeyValueListComponent;
