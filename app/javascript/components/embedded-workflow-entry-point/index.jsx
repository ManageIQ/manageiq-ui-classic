import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, TextInput } from 'carbon-components-react';
import { Close16, TreeViewAlt16 } from '@carbon/icons-react';
import { useFieldApi } from '@@ddf';
import WorkflowEntryPoints from '../workflows/workflow-entry-points';

const EmbeddedWorkflowEntryPoint = (props) => {
  const {
    label, id, field, selected, type,
  } = props;
  const { input } = useFieldApi(props);

  const [showModal, setShowModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState({});
  const [textValue, setTextValue] = useState('');

  useEffect(() => {
    if (selectedValue && selectedValue.name && selectedValue.name.text) {
      setTextValue(selectedValue.name.text);
    } else {
      setTextValue('');
    }
  }, [selectedValue]);

  useEffect(() => {
    if (selectedValue && selectedValue.name && selectedValue.name.text) {
      selectedValue.name.text = textValue;
      input.onChange(selectedValue);
    } else if (!selectedValue || Object.keys(selectedValue).length === 0) {
      // When selectedValue is empty or undefined, pass null to trigger validation
      input.onChange(null);
    } else {
      input.onChange(selectedValue);
    }
  }, [textValue, selectedValue]);

  return (
    <div>
      {showModal ? (
        <WorkflowEntryPoints
          field={field}
          selected={selected}
          type={type}
          setShowModal={setShowModal}
          setSelectedValue={setSelectedValue}
        />
      ) : undefined}
      <div className="entry-point-wrapper">
        <div className="entry-point-text-input">
          <TextInput id={id} type="text" labelText={__(label)} onChange={(value) => setTextValue(value.target.value)} value={textValue} readOnly />
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
                setSelectedValue({});
                // Ensure the input change is triggered to update form state
                input.onChange(null);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

EmbeddedWorkflowEntryPoint.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  selected: PropTypes.string,
  type: PropTypes.string.isRequired,
};

EmbeddedWorkflowEntryPoint.defaultProps = {
  selected: '',
};

export default EmbeddedWorkflowEntryPoint;
