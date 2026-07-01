import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Checkbox } from '@carbon/react';
import { http } from '../../http_api';
import TreeViewRedux from '../tree-view/redux';

const NamespaceTreeModal = ({
  isOpen,
  onClose,
  onApply,
  treeData,
  entryPoint,
  treeState,
}) => {
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
          console.error('Error fetching namespace path:', error);
        });
    }
  }, [selectedNodeId, includeDomainPrefix]);

  // Monitor Redux tree state for node selection
  useEffect(() => {
    if (treeState && treeData) {
      const treeName = treeData.tree_name || 'automate_tree';
      const tree = treeState[treeName];

      if (tree) {
        // Find the selected node in the tree
        const selectedNode = Object.values(tree).find((node) => node.state && node.state.selected);
        if (selectedNode && selectedNode.attr && selectedNode.attr.key) {
          const nodeId = selectedNode.attr.key;
          setSelectedNodeId(nodeId);
        }
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
      size="lg"
    >
      <div style={{ minHeight: '400px' }}>
        {treeData && treeData.bs_tree ? (
          <div>
            <div style={{ marginBottom: '16px', maxHeight: '350px', overflowY: 'auto' }}>
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
              <div
                style={{
                  marginBottom: '16px',
                  padding: '8px',
                  backgroundColor: '#f4f4f4',
                  borderRadius: '4px',
                }}
              >
                <strong>{__('Selected path:')}</strong>
                {' '}
                {namespacePath}
              </div>
            )}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
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
  treeState: PropTypes.shape({}),
};

NamespaceTreeModal.defaultProps = {
  treeData: null,
  entryPoint: 'Namespace',
  treeState: {},
};

// Connect to Redux to access tree state
const mapStateToProps = (state) => ({
  treeState: state,
});

export default connect(mapStateToProps)(NamespaceTreeModal);
