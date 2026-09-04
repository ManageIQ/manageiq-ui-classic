import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, TextInput } from '@carbon/react';
import { Close, TreeViewAlt } from '@carbon/react/icons';
import { useFieldApi } from '@@ddf';
import NamespaceTreeModal from './namespace-tree-modal';
import './miq-ae-class.scss';

const NamespaceSelector = (props) => {
  const {
    label, id, name,
  } = props;
  const { input } = useFieldApi(props);
  const [textValue, setTextValue] = useState(input.value || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTreeSelect = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalApply = ({ displayPath, fqname }) => {
    setTextValue(displayPath);
    input.onChange(fqname);
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
