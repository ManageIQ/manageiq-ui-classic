import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Checkbox, Loading, Modal,
} from '@carbon/react';
import {
  Folder, FolderOpen, EarthFilled,
} from '@carbon/react/icons';
import TreeView from 'react-accessible-treeview';

const NodeIcon = ({ klass, isOpen = false }) => {
  if (klass === 'MiqAeDomain') {
    return <EarthFilled size={16} className="ae-ns-icon" />;
  }
  return isOpen
    ? <FolderOpen size={16} className="ae-ns-icon" />
    : <Folder size={16} className="ae-ns-icon" />;
};
NodeIcon.propTypes = { klass: PropTypes.string, isOpen: PropTypes.bool };

const INITIAL_DATA = [
  {
    name: 'Datastore',
    id: 'datastore_folder',
    children: [],
    parent: null,
  },
];

const stripLeadingSlash = (str) => (str ? str.replace(/^\//, '') : str);

const updateTreeData = (list, id, children) => {
  const updated = list.map((node) => {
    if (node.id === id) {
      return { ...node, children: children.map((el) => el.id) };
    }
    return node;
  });
  return updated.concat(children);
};

const NamespaceTreeModal = ({
  isOpen,
  onClose,
  onApply,
  entryPoint = 'Namespace',
}) => {
  const [data, setData] = useState(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [nodesAlreadyLoaded, setNodesAlreadyLoaded] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [includeDomainPrefix, setIncludeDomainPrefix] = useState(false);

  // Load top-level domains when modal first opens
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setIsLoading(true);
    setData(INITIAL_DATA);
    setNodesAlreadyLoaded([]);
    setSelectedNode(null);
    setIncludeDomainPrefix(false);

    API.get('/api/automate_domains?expand=resources').then((apiData) => {
      const domainNodes = apiData.resources.map((domain) => ({
        id: domain.id,
        name: domain.name,
        children: [],
        parent: 'datastore_folder',
        isBranch: true,
        metadata: {
          fqname: domain.name, domain_fqname: domain.name, loaded: false, klass: 'MiqAeDomain',
        },
      }));
      setData((prev) => updateTreeData(prev, 'datastore_folder', domainNodes));
      setIsLoading(false);
    }).catch((error) => {
      add_flash(error.message || __('Error loading automate domains'), 'error');
      setIsLoading(false);
    });
  }, [isOpen]);

  const onLoadData = ({ element }) => {
    // Skip if already loaded (children array was already populated or marked loaded)
    if (nodesAlreadyLoaded.includes(element.id)) {
      return Promise.resolve();
    }

    const path = (element.metadata && element.metadata.fqname) || element.name;
    return API.get(`/api/automate/${path}?depth=1`).then((result) => {
      // Only include namespaces — exclude MiqAeClass and MiqAeDomain nodes
      const children = (result.resources || [])
        .filter((node) => node.id !== element.id && node.klass !== 'MiqAeClass' && node.klass !== 'MiqAeDomain')
        .map((node) => ({
          id: node.id,
          name: node.name,
          children: [],
          isBranch: true,
          parent: element.id,
          metadata: {
            fqname: stripLeadingSlash(node.fqname),
            domain_fqname: stripLeadingSlash(node.domain_fqname),
            loaded: false,
            klass: node.klass,
          },
        }));

      // Always update — even with empty children — so the spinner condition can resolve.
      // Mark this node as loaded in metadata so the renderer stops showing the spinner.
      setData((prev) => prev.map((node) => {
        if (node.id === element.id) {
          return { ...node, children: children.map((c) => c.id), metadata: { ...node.metadata, loaded: true } };
        }
        return node;
      }).concat(children.filter((c) => !prev.find((n) => n.id === c.id))));

      setNodesAlreadyLoaded((prev) => [...prev, element.id]);
    });
  };

  let displayPath = '';
  let fqname = '';
  if (selectedNode) {
    fqname = selectedNode.metadata.fqname;
    displayPath = includeDomainPrefix ? fqname : selectedNode.metadata.domain_fqname;
  }

  const handleApply = () => {
    if (fqname) {
      onApply({ displayPath, fqname });
    }
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      modalHeading={sprintf(__('Select Entry Point %s'), entryPoint)}
      primaryButtonText={__('Apply')}
      secondaryButtonText={__('Cancel')}
      onRequestClose={onClose}
      onRequestSubmit={handleApply}
      primaryButtonDisabled={!selectedNode}
      size="md"
    >
      {isLoading ? (
        <div className="ae-ns-loading">
          <Loading small withOverlay={false} />
        </div>
      ) : (
        <div>
          <div className="ae-namespace-tree-scroll">
            <TreeView
              data={data}
              aria-label={__('Namespace tree')}
              onLoadData={onLoadData}
              nodeAction="select"
              onSelect={({ treeState }) => {
                const selectedId = treeState.selectedIds.size === 1
                  ? [...treeState.selectedIds][0]
                  : null;
                if (!selectedId) {
                  setSelectedNode(null);
                  return;
                }
                const selectedEl = data.find((n) => n.id === selectedId);
                const isDomainNode = selectedEl && selectedEl.parent === 'datastore_folder';
                setSelectedNode(isDomainNode ? null : (selectedEl || null));
              }}
              nodeRenderer={({
                element, isBranch, isExpanded, isSelected, getNodeProps, handleExpand, level,
              }) => {
                const isLoadPending = isBranch && isExpanded
                  && !(element.metadata && element.metadata.loaded)
                  && !nodesAlreadyLoaded.includes(element.id);
                const isDomainNode = element.parent === 'datastore_folder';
                const nodeProps = isDomainNode
                  ? getNodeProps({ onClick: handleExpand })
                  : getNodeProps();
                const nodeKlass = element.metadata && element.metadata.klass;
                return (
                  <div
                    {...nodeProps}
                    style={{ paddingLeft: 20 * (level - 1) }}
                    className={`ae-ns-node${isSelected && !isDomainNode ? ' ae-ns-node--selected' : ''}${isDomainNode ? ' ae-ns-node--domain' : ''}`}
                  >
                    {isLoadPending ? (
                      <Loading small withOverlay={false} className="ae-ns-spinner" />
                    ) : (
                      <NodeIcon klass={nodeKlass} isOpen={isBranch && isExpanded} />
                    )}
                    <span className="ae-ns-name">{element.name}</span>
                  </div>
                );
              }}
            />
          </div>
          {selectedNode && displayPath && (
            <div className="ae-namespace-selected-path">
              <strong>{__('Selected path:')}</strong>
              {' '}
              {displayPath}
            </div>
          )}
          <div className="ae-namespace-domain-checkbox">
            <Checkbox
              id="include_domain_prefix_chk"
              labelText={__('Include Domain prefix in the path')}
              checked={includeDomainPrefix}
              onChange={(_e, { checked }) => setIncludeDomainPrefix(checked)}
              disabled={!selectedNode}
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

NamespaceTreeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  entryPoint: PropTypes.string,
};

export default NamespaceTreeModal;
