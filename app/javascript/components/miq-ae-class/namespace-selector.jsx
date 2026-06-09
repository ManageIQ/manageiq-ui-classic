import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, TextInput } from '@carbon/react';
import { Close, TreeViewAlt } from '@carbon/react/icons';
import { useFieldApi, useFormApi } from '@@ddf';
import NamespaceTreeModal from './namespace-tree-modal';

const NamespaceSelector = (props) => {
  const {
    label, id, name,
  } = props;
  const { input } = useFieldApi(props);
  const { getState } = useFormApi();
  const { values } = getState();
  const selectedDomainId = values.domain;
  const [textValue, setTextValue] = useState(input.value || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <>
      <div className="namespace-selector-wrapper">
        <div className="namespace-selector-row">
          <div className="namespace-selector-input">
            <TextInput
              id={id}
              name={name}
              labelText={__(label)}
              value={textValue}
              onChange={handleChange}
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
        entryPoint="Namespace"
        domainId={selectedDomainId}
      />
    </>
  );
};

NamespaceSelector.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default NamespaceSelector;
