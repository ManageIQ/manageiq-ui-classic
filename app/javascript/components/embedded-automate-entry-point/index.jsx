import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, TextInput } from '@carbon/react';
import { Close, TreeViewAlt } from '@carbon/react/icons';
import { useFieldApi } from '@@ddf';
import AutomateEntryPoints from '../automate-entry-points';

const EmbeddedAutomateEntryPoint = (props) => {
  const {
    label, id, field, selected = '', type,
  } = props;
  const { input } = useFieldApi(props);

  const [showModal, setShowModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState();
  const [textValue, setTextValue] = useState('');
  const [includeDomainPrefix, setIncludeDomainPrefix] = useState(false);
  // Skip the very first textValue effect so the initial DDF value isn't clobbered
  // before the init effect has a chance to populate selectedValue.
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (selected) {
      setTextValue(selected);
      setSelectedValue(selected);
    } else if (input.value && input.value.element && input.value.element.metadata) {
      // Re-opening after a previous save within the same session: DDF initial value holds
      // the tree-selection object. Restore includeDomainPrefix from the stored value and
      // derive the display text accordingly.
      const storedPrefix = input.value._includeDomainPrefix || false;
      setIncludeDomainPrefix(storedPrefix);
      setSelectedValue(input.value);
      setTextValue(
        storedPrefix
          ? input.value.element.metadata.fqname
          : input.value.element.metadata.domain_fqname || ''
      );
    } else if (input.value && (input.value.ae_namespace || input.value.ae_class || input.value.ae_instance)) {
      // Re-opening after loading from the API: resource_action has the AE path components.
      // Reconstruct a display path from them.
      const { ae_namespace, ae_class, ae_instance } = input.value;
      const parts = [ae_namespace, ae_class, ae_instance].filter(Boolean);
      setSelectedValue(input.value);
      setTextValue(parts.join('/'));
    }
  }, []);

  useEffect(() => {
    // Skip the initial mount — the init effect already populated textValue from input.value.
    // Running here on the first render would see selectedValue=undefined and wipe the text.
    if (isFirstRender.current) return;

    if (selectedValue && selectedValue.element && selectedValue.element.name && selectedValue.element.metadata) {
      if (includeDomainPrefix) {
        setTextValue(selectedValue.element.metadata.fqname);
      } else {
        setTextValue(selectedValue.element.metadata.domain_fqname);
      }
    } else if (!selected && !(selectedValue && (selectedValue.ae_namespace || selectedValue.ae_class || selectedValue.ae_instance))) {
      // Only clear when there is genuinely no selection — preserve API-loaded resource_action shapes.
      setTextValue('');
    }
  }, [selectedValue, includeDomainPrefix]);

  useEffect(() => {
    // Skip the initial synchronous fire so we don't overwrite the DDF initial value
    // with an undefined selectedValue before the init effect has run.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Persist includeDomainPrefix on the value object so it survives a modal reopen
    // within the same session (the init effect reads it back via _includeDomainPrefix).
    const valueToStore = selectedValue
      ? { ...selectedValue, _includeDomainPrefix: includeDomainPrefix }
      : selectedValue;
    input.onChange(valueToStore);
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
                setTextValue('');
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

export default EmbeddedAutomateEntryPoint;

