import React, { useEffect, useState } from 'react';
import {
  Checkbox, Loading, Modal, ModalBody,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import {
  Document16,
  Folder16,
  FolderOpen16,
} from '@carbon/icons-react';
import TreeView from 'react-accessible-treeview';
import './styles.css';

const initialData = [
  {
    name: 'Datastore',
    id: 'datastore_folder',
    children: [],
    parent: null,
  },
];

const AutomateEntryPoints = ({
  selectedValue, showModal, includeDomainPrefix, setSelectedValue, setShowModal, setIncludeDomainPrefix,
}) => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [nodesAlreadyLoaded, setNodesAlreadyLoaded] = useState([]);
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [selectedNode, setSelectedNode] = useState();

  const updateTreeData = (list, id, children) => {
    const data = list.map((node) => {
      if (node.id === id) {
        node.children = children.map((el) => el.id);
      }
      return node;
    });
    return data.concat(children);
  };

  useEffect(() => {
    if (selectedValue.element) {
      data.forEach((node) => {
        if (node.id === selectedValue.element.id) {
          document.getElementById(node.id).classList.add('currently-selected');
          document.getElementById(node.id).style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
        }
      });
    }
  }, [selectedValue]);

  useEffect(() => {
    miqSparkleOn();
    const newChildren = [];
    API.get('/api/automate_domains?expand=resources').then((apiData) => {
      apiData.resources.forEach((domain) => {
        newChildren.push({
          id: domain.id,
          name: domain.name,
          children: [],
          parent: 'datastore_folder',
          metadata: { parent: domain.name },
          isBranch: true,
        });
      });
      return newChildren;
    }).then((newChildren) => new Promise((resolve) => {
      setTimeout(() => {
        setData((value) => updateTreeData(value, 'datastore_folder', newChildren));
        resolve();
      }, 1000);
    })).then(() => {
      setIsLoading(false);
      miqSparkleOff();
    });
  }, []);

  const onLoadData = ({ element }) => {
    let path = element.name;
    if (element.metadata && element.metadata.fqname) {
      path = element.metadata.fqname;
    }
    API.get(`/api/automate/${path}?depth=1`).then((newNodes) => {
      const newChildren = [];
      newNodes.resources.forEach((newNode) => {
        if (element.id !== newNode.id) {
          if (newNode.klass !== 'MiqAeClass') {
            newChildren.push({
              id: newNode.id,
              name: newNode.name,
              children: [],
              isBranch: true,
              parent: element.id,
              metadata: { domain_fqname: newNode.domain_fqname, fqname: newNode.fqname },
            });
          } else {
            newChildren.push({
              id: newNode.id,
              name: newNode.name,
              children: [],
              parent: element.id,
              metadata: { domain_fqname: newNode.domain_fqname, fqname: newNode.fqname },
            });
          }
        }
      });
      return new Promise((resolve) => {
        if (element.children.length > 0) {
          resolve();
          return;
        }
        setTimeout(() => {
          setData((value) =>
            updateTreeData(value, element.id, newChildren));
          resolve();
        }, 1000);
      });
    });
  };

  const wrappedOnLoadData = async({ element }) => {
    const nodeHasNoChildData = element.children.length === 0;
    const nodeHasAlreadyBeenLoaded = nodesAlreadyLoaded.find(
      (e) => e.id === element.id
    );

    await onLoadData({ element });

    if (nodeHasNoChildData && !nodeHasAlreadyBeenLoaded) {
      setNodesAlreadyLoaded([...nodesAlreadyLoaded, element]);

      setTimeout(() => {
      }, 1000);
    }
  };
  wrappedOnLoadData.propTypes = {
    element: PropTypes.objectOf({ children: PropTypes.array, id: PropTypes.number }).isRequired,
  };
  wrappedOnLoadData.defaultProps = {
  };

  const onSelect = (value) => {
    if (value.isBranch === false && value.isSelected) {
      data.forEach((node) => {
        if (selectedNode && (node.id === selectedNode.element.id)) {
          document.getElementById(node.id).style.backgroundColor = 'transparent';
        }
      });
      document.getElementById(value.element.id).style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
      setSelectedNode(value);
      setDisableSubmit(false);
    }
  };

  const onExpand = (value) => {
    if (value.isExpanded && selectedNode && document.getElementById(selectedNode.element.id)) {
      document.getElementById(selectedNode.element.id).style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    }
  };

  const FolderIcon = ({ isOpen }) =>
    (isOpen ? (
      <FolderOpen16 className="icon" />
    ) : (
      <Folder16 className="icon" />
    ));

  FolderIcon.propTypes = {
    isOpen: PropTypes.bool,
  };
  FolderIcon.defaultProps = {
    isOpen: false,
  };

  const FileIcon = () => <Document16 className="icon" />;

  return !isLoading && (
    <Modal
      open={showModal}
      primaryButtonText={__('OK')}
      secondaryButtonText={__('Cancel')}
      onRequestSubmit={() => {
        setSelectedValue(selectedNode);
        setShowModal(false);
      }}
      onRequestClose={() => {
        setShowModal(false);
      }}
      onSecondarySubmit={() => {
        setShowModal(false);
      }}
      primaryButtonDisabled={disableSubmit}
    >
      <ModalBody>
        <div>
          <div className="automate_entry_points">
            <TreeView
              data={data}
              aria-label="Automate Entry Points tree"
              onSelect={onSelect}
              onLoadData={wrappedOnLoadData}
              onExpand={onExpand}
              togglableSelect
              nodeRenderer={({
                element,
                isBranch,
                isExpanded,
                getNodeProps,
                level,
              }) => {
                const branchNode = (isExpanded, element) => (isExpanded && element.children.length === 0 ? (
                  <div className="loadingDiv">
                    <Loading small withOverlay={false} />
                  </div>
                ) : (
                  null
                ));
                return (
                  <div
                    {...getNodeProps()}
                    style={{ marginLeft: 40 * (level - 1) }}
                    id={element.id}
                  >
                    {isBranch && branchNode(isExpanded, element)}
                    {isBranch ? (
                      <div className="iconDiv">
                        <FolderIcon isOpen={isExpanded} />
                      </div>
                    ) : (
                      <div className="iconDiv">
                        <FileIcon filename={element.name} />
                      </div>
                    )}
                    <span className="name">{element.name}</span>
                  </div>
                );
              }}
            />
          </div>
          {setIncludeDomainPrefix
            ? (
              <div className="checkboxDiv">
                <Checkbox
                  id="includeDomainPrefix"
                  labelText={__('Include Domain prefix in the path')}
                  checked={includeDomainPrefix}
                  onChange={(checked) => setIncludeDomainPrefix(checked)}
                />
              </div>
            ) : null}
        </div>
      </ModalBody>
    </Modal>
  );
};

AutomateEntryPoints.propTypes = {
  field: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  selected: PropTypes.string,
  selectedValue: PropTypes.objectOf(PropTypes.any),
  showModal: PropTypes.bool,
  includeDomainPrefix: PropTypes.bool,
  setSelectedValue: PropTypes.func.isRequired,
  setShowModal: PropTypes.func.isRequired,
  setIncludeDomainPrefix: PropTypes.func,
};

AutomateEntryPoints.defaultProps = {
  selected: '',
  selectedValue: {},
  showModal: false,
  includeDomainPrefix: false,
  setIncludeDomainPrefix: undefined,
};

export default AutomateEntryPoints;
