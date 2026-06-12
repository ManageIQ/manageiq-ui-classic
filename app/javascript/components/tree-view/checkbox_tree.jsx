import { useState, useEffect, useMemo } from 'react';
import CheckboxTree from 'react-checkbox-tree';
import { Button } from '@carbon/react';
import { useFieldApi } from '@@ddf';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import {
  CheckboxChecked, Checkbox, CheckboxCheckedFilled, ChevronRight, ChevronDown, Folder, FolderOpen,
} from '@carbon/react/icons';

const carbonIcons = {
  check: <span><CheckboxCheckedFilled /></span>,
  uncheck: <span><Checkbox /></span>,
  halfCheck: <span><CheckboxChecked /></span>,
  expandClose: <span><ChevronRight /></span>,
  expandOpen: <span><ChevronDown /></span>,
  parentClose: <span><Folder /></span>,
  parentOpen: <span><FolderOpen /></span>,
};

const CheckboxTreeComponent = (props) => {
  const fieldApi = useFieldApi(props);
  const { input, meta } = fieldApi;

  // Extract custom props from fieldApi since useFieldApi consumes them
  const {
    label, checked, isRequired, showSelectButtons, showSelectionCount, emptyMessage, transformNodes,
  } = fieldApi;

  // Get nodes from fieldApi - useFieldApi passes custom props through fieldApi
  const nodes = fieldApi.nodes || [];

  // Transform nodes if needed (e.g., {key, text, nodes} -> {value, label, children})
  const transformedNodes = useMemo(() => {
    if (!nodes || (Array.isArray(nodes) && nodes.length === 0)) {
      return [];
    }
    if (transformNodes) {
      const convertNode = (node) => ({
        value: node.key || node.value,
        label: node.text || node.label,
        children: node.nodes ? node.nodes.map(convertNode) : (node.children || undefined),
      });
      return Array.isArray(nodes) ? nodes.map(convertNode) : [convertNode(nodes)];
    }
    return Array.isArray(nodes) ? nodes : [nodes];
  }, [nodes, transformNodes]);

  const [treeState, setTreeState] = useState({
    checked: checked || input.value || [],
    expanded: (transformedNodes && transformedNodes[0] && [transformedNodes[0].value]) || [],
  });

  // Sync checked state with form input only when user makes changes
  useEffect(() => {
    input.onChange(treeState.checked);
  }, [treeState.checked]);

  const handleSelectAll = () => {
    const getAllNodeValues = (nodeList) => {
      let values = [];
      nodeList.forEach((node) => {
        values.push(node.value);
        if (node.children) {
          values = values.concat(getAllNodeValues(node.children));
        }
      });
      return values;
    };
    const allValues = getAllNodeValues(transformedNodes);
    setTreeState({ ...treeState, checked: allValues });
  };

  const handleDeselectAll = () => {
    setTreeState({ ...treeState, checked: [] });
  };

  // Handle empty state
  if (!transformedNodes || transformedNodes.length === 0) {
    return (
      <div className="checkbox-tree-wrapper">
        {label && <p className="checkbox-tree-title">{label}</p>}
        <div className="checkbox-tree-empty">
          <p>{emptyMessage || __('No items available')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkbox-tree-wrapper">
      {isRequired ? <span className="checkbox-tree-required-tag">*</span> : undefined}
      {label && <p className="checkbox-tree-title">{label}</p>}
      {showSelectButtons && (
        <div className="checkbox-tree-actions">
          <Button kind="ghost" size="sm" onClick={handleSelectAll}>
            {__('Select All')}
          </Button>
          <Button kind="ghost" size="sm" onClick={handleDeselectAll}>
            {__('Deselect All')}
          </Button>
        </div>
      )}
      <CheckboxTree
        icons={carbonIcons}
        nodes={transformedNodes}
        checked={treeState.checked}
        expanded={treeState.expanded}
        onCheck={(checked) => {
          setTreeState({ ...treeState, checked });
        }}
        onExpand={(expanded) => setTreeState({ ...treeState, expanded })}
      />
      {showSelectionCount && (
        <div className="checkbox-tree-selection-count">
          {`${treeState.checked.length} ${__('item(s) selected')}`}
        </div>
      )}
      {meta && meta.error && meta.touched && (
        <div className="checkbox-tree-error">
          {meta.error}
        </div>
      )}
    </div>
  );
};

// Props are passed through Data Driven Form's useFieldApi hook
CheckboxTreeComponent.propTypes = {};

CheckboxTreeComponent.defaultProps = {
  label: '',
  nodes: [],
  checked: [],
  isRequired: false,
  showSelectButtons: false,
  showSelectionCount: false,
  emptyMessage: '',
  transformNodes: false,
};

export default CheckboxTreeComponent;
