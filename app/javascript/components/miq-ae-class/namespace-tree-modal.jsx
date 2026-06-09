import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Modal, Checkbox } from '@carbon/react';
import { http } from '../../http_api';
import TreeViewRedux from '../tree-view/redux';

const NamespaceTreeModal = ({
  isOpen,
  onClose,
  onApply,
  treeData = null,
  entryPoint = 'Namespace',
}) => {
  const treeName = (treeData && treeData.tree_name) || 'automate_tree';
  const treeState = useSelector((state) => state[treeName]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [namespacePath, setNamespacePath] = useState('');
  const [includeDomainPrefix, setIncludeDomainPrefix] = useState(false);

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setSelectedNodeId(null);
      setNamespacePath('');
      setIncludeDomainPrefix(false);
    }
  }, [isOpen]);

  // Fetch namespace path when node is selected or domain prefix checkbox changes
  useEffect(() => {
    if (selectedNodeId) {
      http.post('/miq_ae_class/namespace_path', {
        node_id: selectedNodeId,
        include_domain: includeDomainPrefix,
      })
        .then((data) => {
          if (data.path) {
            setNamespacePath(data.path);
          }
        })
        .catch((error) => {
          const errorMessage = error.response?.data?.error || error.message || __('Error fetching namespace path');
          add_flash(errorMessage, 'error');
        });
    }
  }, [selectedNodeId, includeDomainPrefix]);

  // Monitor Redux tree state for node selection
  useEffect(() => {
    if (treeState && treeData) {
      const selectedNode = Object.values(treeState).find((node) => node.state && node.state.selected);
      if (selectedNode && selectedNode.attr && selectedNode.attr.key) {
        setSelectedNodeId(selectedNode.attr.key);
      }
    }
  }, [treeState, treeData]);

  const handleApply = () => {
    if (namespacePath) {
      onApply(namespacePath);
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const hasSelection = selectedNodeId !== null;

  return (
    <Modal
      open={isOpen}
      modalHeading={sprintf(__('Select Entry Point %s'), entryPoint || 'Namespace')}
      primaryButtonText={__('Apply')}
      secondaryButtonText={__('Cancel')}
      onRequestClose={handleCancel}
      onRequestSubmit={handleApply}
      primaryButtonDisabled={!hasSelection}
      size="md"
    >
      <div>
        {treeData && treeData.bs_tree ? (
          <div>
            <div className="ae-namespace-tree-scroll">
              <TreeViewRedux
                tree_name={treeData.tree_name || 'automate_tree'}
                bs_tree={treeData.bs_tree}
                click_url=""
                onclick=""
                checkboxes={false}
                allow_reselect
              />
            </div>
            {hasSelection && namespacePath && (
              <div className="ae-namespace-selected-path">
                <strong>{__('Selected path:')}</strong>
                {' '}
                {namespacePath}
              </div>
            )}
            <div className="ae-namespace-domain-checkbox">
              <Checkbox
                id="include_domain_prefix_chk"
                labelText={__('Include Domain prefix in the path')}
                checked={includeDomainPrefix}
                onChange={(e) => setIncludeDomainPrefix(e.target.checked)}
                disabled={!hasSelection}
              />
            </div>
          </div>
        ) : (
          <div>{__('Loading tree...')}</div>
        )}
      </div>
    </Modal>
  );
};

NamespaceTreeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  treeData: PropTypes.shape({
    tree_name: PropTypes.string,
    bs_tree: PropTypes.string,
    click_url: PropTypes.string,
    onclick: PropTypes.string,
  }),
  entryPoint: PropTypes.string,
};

export default NamespaceTreeModal;
