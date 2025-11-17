import React, { useEffect, useState } from 'react';
import {
  Camera16, ChevronRight16, ChevronDown16, VirtualMachine16,
} from '@carbon/icons-react';
import TreeView, { flattenTree } from 'react-accessible-treeview';
import './styles.css';
import PropTypes from 'prop-types';

const allNodeData = [];

const convertData = (node) => {
  allNodeData.push(
    {
      name: node.text,
      id: node.key,
      selectable: node.selectable,
      tooltip: node.tooltip,
      icon: node.icon,
    }
  );
  const treeData = {
    name: node.text, // Use the `text` property as the `name`
    id: node.key, // Use the `key` property as the `id`
    children: node.nodes ? node.nodes.map(convertData) : [], // Recursively process children
  };

  return treeData;
};

const SnapshotTree = ({ nodes, setCurrentSnapshot }) => {
  const [selectedNode, setSelectedNode] = useState('');

  const data = {
    name: '',
    children: nodes.map(convertData),
  };
  const treeData = flattenTree(data);
  const expandedIds = [];
  treeData.forEach((node) => {
    expandedIds.push(node.id);

    allNodeData.forEach((nodeData) => {
      if (nodeData.id === node.id) {
        const metadata = {
          selectable: nodeData.selectable || false,
          tooltip: nodeData.tooltip || nodeData.name,
          icon: nodeData.icon || 'fa fa-camera',
        };
        node.metadata = metadata;
      }
    });
  });

  const nodeClick = (e, node) => {
    if (node.metadata.selectable === false) {
      // If the clicked node is already selected or root is selected, do nothing
      return;
    }

    const ids = node.id.split('-');
    const shortId = ids[ids.length - 1];
    miqSparkleOn();
    http.post(`/${ManageIQ.controller}/snap_pressed/${encodeURIComponent(shortId)}`).then((response) => {
      if (response.data) {
        const tempData = response.data;
        tempData.size = response.data.size;
        tempData.time = response.data.time;
        setCurrentSnapshot(tempData);
      }
      miqSparkleOff();
    });

    e.stopPropagation();
    setSelectedNode(e.target.id);
  };

  const addSelectedClassName = () => {
    // Remove 'selected' class from all elements
    const selectedElements = document.querySelectorAll('.selected-snapshot');
    selectedElements.forEach((el) => {
      el.classList.remove('selected-snapshot');
    });

    const selectedElement = document.getElementById(selectedNode);
    if (selectedElement) {
      selectedElement.parentNode.classList.add('selected-snapshot');
    }
  };

  useEffect(() => {
    addSelectedClassName();
  }, [selectedNode]);

  useEffect(() => {
    treeData.forEach((node) => {
      if (node.name.includes(__('(Active)'))) {
        setSelectedNode(node.id);
      }
    });
  }, []);

  const ArrowIcon = (isOpen) => {
    let icon = <ChevronRight16 />;
    if (isOpen && isOpen.isOpen) {
      icon = <ChevronDown16 />;
    }
    return <div className="arrow-div">{icon}</div>;
  };

  const NodeIcon = (icon) => {
    if (icon === 'pficon pficon-virtual-machine') {
      return <VirtualMachine16 />;
    }
    return <Camera16 />;
  };

  // First pull in node data and go through flattened tree to add metadata like icons and selectable
  // Then add icons, tooltip and special handling

  return (
    <div>
      <div className="vm-snapshot-tree">
        <TreeView
          data={treeData}
          aria-label="Single select"
          multiSelect={false}
          onExpand={addSelectedClassName}
          defaultExpandedIds={expandedIds}
          propagateSelectUpwards
          togglableSelect
          nodeAction="check"
          nodeRenderer={({
            element,
            isBranch,
            isExpanded,
            getNodeProps,
            level,
            handleExpand,
          }) => (
            <div
              {...getNodeProps({ onClick: handleExpand })}
              style={{ paddingLeft: 40 * (level - 1) }}
            >
              {isBranch && <ArrowIcon isOpen={isExpanded} />}
              {element.metadata && element.metadata.icon && (
                <div className="node-icon-div">
                  <NodeIcon icon={element.metadata.icon} />
                </div>
              )}
              <span
                key={element.id}
                id={element.id}
                onClick={(e) => nodeClick(e, element)}
                onKeyDown={(e) => e.key === 'Enter' && nodeClick(e)}
                role="button"
                tabIndex={0}
                className="name"
              >
                {element.name}
              </span>
            </div>
          )}
        />
      </div>
    </div>
  );
};

SnapshotTree.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.any).isRequired,
  setCurrentSnapshot: PropTypes.func.isRequired,
};

export default SnapshotTree;
