import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, TextInput } from 'carbon-components-react';
import { Close16, TreeViewAlt16 } from '@carbon/icons-react';
import { useFieldApi } from '@@ddf';
import AutomateEntryPoints from '../automate-entry-points';

const EmbeddedAutomateEntryPoint = (props) => {
  const {
    label, id, field, selected, type,
  } = props;
  const { input } = useFieldApi(props);

  const [showModal, setShowModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState();
  const [textValue, setTextValue] = useState('');
  const [includeDomainPrefix, setIncludeDomainPrefix] = useState(false);

  useEffect(() => {
    if (selected) {
      setTextValue(selected);
      setSelectedValue(selected);
    }
  }, []);

  useEffect(() => {
    if (selectedValue && selectedValue.element && selectedValue.element.name && selectedValue.element.metadata) {
      if (includeDomainPrefix) {
        setTextValue(selectedValue.element.metadata.fqname);
      } else {
        setTextValue(selectedValue.element.metadata.domain_fqname);
      }
    } else if (!selected) {
      setTextValue('');
    }
  }, [selectedValue, includeDomainPrefix]);

  useEffect(() => {
  if (selectedValue && selectedValue.name && selectedValue.name.text) {
    if (selectedValue.name.text !== textValue) {
      const updatedValue = {
        ...selectedValue,
        name: {
          ...selectedValue.name,
          text: textValue
        }
      };
      
      // Update the form without triggering another effect run
      input.onChange(updatedValue);
      
      // Update the state
      setSelectedValue(updatedValue);
    }
  } else if (!selectedValue || Object.keys(selectedValue || {}).length === 0) {
    // When selectedValue is empty or undefined, pass null to trigger validation
    input.onChange(null);
  } else {
    input.onChange(selectedValue);
  }
}, [textValue]);


  return (
    <div>
      <AutomateEntryPoints
        field={field}
        selectedValue={selectedValue}
        showModal={showModal}
        includeDomainPrefix={includeDomainPrefix}
        type={type}
        setSelectedValue={setSelectedValue}
        setShowModal={setShowModal}
        setIncludeDomainPrefix={setIncludeDomainPrefix}
      />
      <div className="entry-point-wrapper">
        <div className="entry-point-text-input">
          <TextInput 
            id={id}
            type="text"
            labelText={__(label)}
            value={textValue}
            readOnly />
        </div>
        <div className="entry-point-buttons">
          <div className="entry-point-open">
            <Button
              renderIcon={TreeViewAlt16}
              iconDescription={sprintf(__('Click to select %s'), label)}
              hasIconOnly
              onClick={() => setShowModal(true)}
            />
          </div>
          <div className="entry-point-remove">
            <Button
              renderIcon={Close16}
              iconDescription={sprintf(__('Remove this %s'), label)}
              hasIconOnly
              onClick={() => {
                debugger
                setSelectedValue(null);
                setTextValue('');
                // Ensure the input change is triggered to update form state
                // input.onChange(null);
                input.onChange({
                  automateEntryPoint: null,
                  value: null  // Also clear any associated value
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

EmbeddedAutomateEntryPoint.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  selected: PropTypes.string,
  type: PropTypes.string.isRequired,
};

EmbeddedAutomateEntryPoint.defaultProps = {
  selected: '',
};

export default EmbeddedAutomateEntryPoint;
