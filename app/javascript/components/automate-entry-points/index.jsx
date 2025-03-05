import React, { useEffect, useState } from 'react';
import { Loading, Modal, ModalBody } from 'carbon-components-react';
import PropTypes, { number } from 'prop-types';
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

const MultiSelectCheckboxAsync = () => {
  const [data, setData] = useState(initialData);
  const [nodesAlreadyLoaded, setNodesAlreadyLoaded] = useState([]);
  const [open, setOpen] = useState(true);
  const [selectedValue, setSelectedValue] = useState();
  const [disableSubmit, setDisableSubmit] = useState(true);

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
    miqSparkleOn();
    const newChildren = [];
    API.get('/api/automate_domains?expand=resources').then((apiData) => {
      console.log(apiData);
      apiData.resources.forEach((domain) => {
        newChildren.push({
          id: domain.id,
          name: domain.name,
          children: [],
          parent: 'datastore_folder',
          metadata: {},
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
              metadata: { fqname: newNode.fqname },
            });
          } else {
            newChildren.push({
              id: newNode.id,
              name: newNode.name,
              children: [],
              parent: element.id,
              metadata: { fqname: newNode.fqname },
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
    element: PropTypes.objectOf({ children: PropTypes.array, id: number }).isRequired,
  };
  wrappedOnLoadData.defaultProps = {
  };

  const onSelect = (value) => {
    if (value.isBranch === false && value.isSelected) {
      setSelectedValue(value);
      setDisableSubmit(false);
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

  return (
    <Modal
      open={open}
      primaryButtonText={__('OK')}
      secondaryButtonText={__('Cancel')}
      onRequestSubmit={() => {
        console.log(selectedValue);
        setOpen(false);
      }}
      onRequestClose={() => {
        setOpen(false);
      }}
      onSecondarySubmit={() => {
        setOpen(false);
      }}
      primaryButtonDisabled={disableSubmit}
    >
      <ModalBody>
        <div>
          <div className="checkbox">
            <TreeView
              data={data}
              aria-label="Checkbox tree"
              onSelect={(value) => onSelect(value)}
              onLoadData={wrappedOnLoadData}
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
        </div>
      </ModalBody>
    </Modal>
  );
};

MultiSelectCheckboxAsync.propTypes = {
};

MultiSelectCheckboxAsync.defaultProps = {
};

export default MultiSelectCheckboxAsync;
