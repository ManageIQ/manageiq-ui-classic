import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, TextInput } from '@carbon/react';
import { Close, TreeViewAlt } from '@carbon/react/icons';
import { prepareProps } from '@data-driven-forms/carbon-component-mapper';
import { useFieldApi, useFormApi } from '@@ddf';
import NamespaceTreeModal from './namespace-tree-modal';

const NamespaceSelector = ({
  id,
  name,
  label,
  isRequired = false,
  helperText = '',
  validateOnMount = false,
  ...props
}) => {
  const {
    input,
    meta,
    labelText,
  } = useFieldApi(prepareProps({
    id,
    name,
    label,
    isRequired,
    helperText,
    validateOnMount,
    ...props,
  }));
  const { getState } = useFormApi();
  const { values } = getState();
  const selectedDomainId = values.domain;
  const [textValue, setTextValue] = useState(input.value || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync local display value when the DDF field value is cleared externally
  useEffect(() => {
    if (!input.value) {
      setTextValue('');
    }
  }, [input.value]);

  const handleTreeSelect = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalApply = ({ displayPath, domainFqname }) => {
    setTextValue(displayPath);
    input.onChange(domainFqname);
  };

  const handleRemove = () => {
    setTextValue('');
    input.onChange('');
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setTextValue(value);
    input.onChange(value);
  };

  const invalid = (meta.touched || validateOnMount) && meta.error;

  return (
    <>
      <div className="namespace-selector-wrapper">
        <div className="namespace-selector-row">
          <div className="namespace-selector-input">
            <TextInput
              id={id}
              name={name}
              labelText={labelText}
              helperText={helperText}
              value={textValue}
              onChange={handleChange}
              onBlur={input.onBlur}
              invalid={Boolean(invalid)}
              invalidText={invalid || ''}
            />
          </div>
          <div className="namespace-selector-buttons">
            <Button
              renderIcon={TreeViewAlt}
              size="md"
              iconDescription={__('Click to select Provisioning Entry Point')}
              hasIconOnly
              onClick={handleTreeSelect}
              kind="secondary"
            />
            <Button
              renderIcon={Close}
              size="md"
              iconDescription={__('Remove this Namespace')}
              hasIconOnly
              onClick={handleRemove}
              disabled={!textValue}
              kind="secondary"
            />
          </div>
        </div>
      </div>
      <NamespaceTreeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onApply={handleModalApply}
        domainId={selectedDomainId}
      />
    </>
  );
};

NamespaceSelector.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  isRequired: PropTypes.bool,
  helperText: PropTypes.string,
  validateOnMount: PropTypes.bool,
};

export default NamespaceSelector;
