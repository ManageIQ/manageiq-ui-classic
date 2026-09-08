import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, TextInput } from '@carbon/react';
import { Close, TreeViewAlt } from '@carbon/react/icons';
import { useFieldApi } from '@@ddf';
import WorkflowEntryPoints from '../workflows/workflow-entry-points';

const EmbeddedWorkflowEntryPoint = (props) => {
  const {
    label,
    id,
    field,
    selected = '',
    type,
  } = props;
  const { input } = useFieldApi(props);

  const [showModal, setShowModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState({});
  const [textValue, setTextValue] = useState('');
  // Skip the very first textValue effect so the initial DDF value isn't clobbered
  // before the init effect has a chance to populate selectedValue.
  const isFirstRender = useRef(true);

  // Re-opening after a save: DDF initial value holds the previously selected row object
  // (in-session) or an API-shaped resource_action with configuration_script_id (page reload).
  useEffect(() => {
    if (input.value && input.value.id && input.value.name && input.value.name.text) {
      // In-session: full row object with name.text
      setSelectedValue(input.value);
      setTextValue(input.value.name.text);
    } else if (input.value && input.value.configuration_script_id) {
      // From API: resource_action only carries configuration_script_id (workflow_name is stripped
      // by sanitiseField before the POST). Look up the name from the API so we can display it.
      const scriptId = input.value.configuration_script_id;
      API.get(`/api/configuration_script_payloads/${scriptId}?attributes=name`)
        .then((response) => {
          const workflowName = response.name || String(scriptId);
          setSelectedValue({ ...input.value, name: { text: workflowName } });
          setTextValue(workflowName);
        })
        .catch(() => {
          // If the lookup fails, fall back to showing the ID
          setSelectedValue(input.value);
          setTextValue(String(scriptId));
        });
    }
  }, []);

  useEffect(() => {
    // Skip the initial mount — the init effect already populated textValue from input.value.
    // Running here on the first render would see selectedValue={} and wipe the text.
    if (isFirstRender.current) return;

    if (selectedValue && selectedValue.name && selectedValue.name.text) {
      setTextValue(selectedValue.name.text);
    } else if (selectedValue && selectedValue.configuration_script_id) {
      // API-loaded shape already handled by init effect — don't clear it.
    } else if (!input.value || !input.value.id) {
      setTextValue('');
    }
  }, [selectedValue]);

  useEffect(() => {
    // Skip the initial synchronous fire so we don't overwrite the DDF initial value
    // with an empty selectedValue before the init effect has run.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (selectedValue && selectedValue.name && selectedValue.name.text) {
      selectedValue.name.text = textValue;
    }
    input.onChange(selectedValue);
  }, [textValue]);

  return (
    <div>
      {showModal && (
        <WorkflowEntryPoints
          field={field}
          selected={selected}
          type={type}
          setShowModal={setShowModal}
          setSelectedValue={setSelectedValue}
        />
      )}
      <div className="entry-point-wrapper">
        <div className="entry-point-text-input">
          <TextInput id={id} type="text" labelText={__(label)} onChange={(value) => setTextValue(value.target.value)} value={textValue} />
        </div>
        <div className="entry-point-buttons">
          <div className="entry-point-open">
            <Button
              renderIcon={(props) => <TreeViewAlt size={16} {...props} />}
              size="md"
              iconDescription={sprintf(__('Click to select %s'), label)}
              hasIconOnly
              onClick={() => setShowModal(true)}
            />
          </div>
          <div className="entry-point-remove">
            <Button
              renderIcon={(props) => <Close size={16} {...props} />}
              size="md"
              iconDescription={sprintf(__('Remove this %s'), label)}
              hasIconOnly
              onClick={() => {
                setSelectedValue({});
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

export default EmbeddedWorkflowEntryPoint;
