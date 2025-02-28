import React, { useEffect, useRef, useState } from 'react';
import { Loading } from 'carbon-components-react';
import PropTypes from 'prop-types';
import {
  CheckboxCheckedFilled16,
  Document16,
  Folder16,
  FolderOpen16,
  CheckboxIndeterminateFilled16,
  Checkbox16,
  CaretDown16,
} from '@carbon/icons-react';
import TreeView from 'react-accessible-treeview';
import cx from 'classnames';
import './styles.css';

let initialData = [
  {
    name: '',
    id: 0,
    children: [1, 2, 3],
    parent: null,
  },
  {
    name: 'Fruits',
    children: [],
    id: 1,
    parent: 0,
    isBranch: true,
  },
  {
    name: 'Drinks',
    children: [4, 5],
    id: 2,
    parent: 0,
    isBranch: true,
  },
  {
    name: 'Vegetables',
    children: [],
    id: 3,
    parent: 0,
    isBranch: true,
  },
  {
    name: 'Pine colada',
    children: [],
    id: 4,
    parent: 2,
  },
  {
    name: 'Water',
    children: [],
    id: 5,
    parent: 2,
  },
];

initialData = [
  {
    name: 'Datastore',
    id: 'datastore_folder',
    children: [],
    parent: null,
  },
];

const MultiSelectCheckboxAsync = () => {
  const loadedAlertElement = useRef(null);
  const [data, setData] = useState(initialData);
  const [nodesAlreadyLoaded, setNodesAlreadyLoaded] = useState([]);

  const updateTreeData = (list, id, children) => {
    console.log(list);
    console.log(id);
    console.log(children);
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
    console.log(element);
    return new Promise((resolve) => {
      if (element.children.length > 0) {
        resolve();
        return;
      }
      setTimeout(() => {
        setData((value) =>
          updateTreeData(value, element.id, [
            {
              name: `Child Node ${value.length}`,
              children: [],
              id: value.length,
              parent: element.id,
              isBranch: true,
            },
            {
              name: 'Another child Node',
              children: [],
              id: value.length + 1,
              parent: element.id,
            },
          ]));
        resolve();
      }, 1000);
    });
  };

  const wrappedOnLoadData = async(props) => {
    const nodeHasNoChildData = props.element.children.length === 0;
    const nodeHasAlreadyBeenLoaded = nodesAlreadyLoaded.find(
      (e) => e.id === props.element.id
    );

    await onLoadData(props);

    if (nodeHasNoChildData && !nodeHasAlreadyBeenLoaded) {
      setNodesAlreadyLoaded([...nodesAlreadyLoaded, props.element]);

      // Clearing aria-live region so loaded node alerts no longer appear in DOM
      setTimeout(() => {
      }, 5000);
    }
  };

  const onSelect = (value) => {
    if (value.isBranch === false && value.isSelected) {
      console.log(value);
    }
  };

  const ArrowIcon = ({ isOpen, className }) => {
    const baseClass = 'arrow';
    const classes = cx(
      baseClass,
      { [`${baseClass}--closed`]: !isOpen },
      { [`${baseClass}--open`]: isOpen },
      className
    );
    return <CaretDown16 className={classes} />;
  };

  const CheckBoxIcon = ({ variant, ...rest }) => {
    switch (variant) {
      case 'all':
        return <CheckboxCheckedFilled16 />;
      case 'none':
        return <Checkbox16 />;
      case 'some':
        return <CheckboxIndeterminateFilled16 />;
      default:
        return null;
    }
  };

  const FolderIcon = ({ isOpen }) =>
    (isOpen ? (
      <FolderOpen16 className="icon" />
    ) : (
      <Folder16 className="icon" />
    ));
  FolderIcon.propTypes = {
    isOpen: PropTypes.bool.isRequired,
  };

  const FileIcon = () => <Document16 className="icon" />;

  return (
    <>
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
              isSelected,
              isHalfSelected,
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
                  {/* <CheckBoxIcon
                      className="checkbox-icon"
                      onClick={(e) => {
                        handleSelect(e);
                        e.stopPropagation();
                      }}
                      variant={
                        isHalfSelected ? "some" : isSelected ? "all" : "none"
                      }
                    /> */}
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
    </>
  );
};

MultiSelectCheckboxAsync.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

MultiSelectCheckboxAsync.defaultProps = {
};

export default MultiSelectCheckboxAsync;
