import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, TextInput } from '@carbon/react';
import { Close, TreeViewAlt } from '@carbon/react/icons';
import { useFieldApi } from '@@ddf';
import { http } from '../../http_api';
import NamespaceTreeModal from './namespace-tree-modal';

const NamespaceSelector = (props) => {
  const {
    label, id, name,
  } = props;
  const { input } = useFieldApi(props);
  const [textValue, setTextValue] = useState(input.value || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [treeData, setTreeData] = useState(null);
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  const handleTreeSelect = () => {
    // Fetch tree data and open modal
    setIsLoadingTree(true);
    http.post('/miq_ae_class/get_automate_tree_data')
      .then((data) => {
        setTreeData(data);
        setIsModalOpen(true);
        setIsLoadingTree(false);
      })
      .catch((error) => {
        console.error('Error loading tree data:', error);
        setIsLoadingTree(false);
      });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalApply = (namespacePath) => {
    setTextValue(namespacePath);
    input.onChange(namespacePath);
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <TextInput
              id={id}
              name={name}
              labelText={__(label)}
              value={textValue}
              onChange={handleChange}
            />
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <Button
              renderIcon={(iconProps) => <TreeViewAlt size={16} {...iconProps} />}
              size="md"
              iconDescription={__('Click to select Provisioning Entry Point')}
              hasIconOnly
              onClick={handleTreeSelect}
              kind="secondary"
              disabled={isLoadingTree}
            />
            <Button
              renderIcon={(iconProps) => <Close size={16} {...iconProps} />}
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
        treeData={treeData}
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
