import React, { useState, useEffect } from 'react';
import CheckboxTree from 'react-checkbox-tree';
import PropTypes from 'prop-types';
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
  const {
    label, nodes, checked, isRequired,
  } = props;
  const { input } = useFieldApi(props);

  const [treeState, setTreeState] = useState({
    checked: checked || [],
    expanded: (nodes && nodes[0] && [nodes[0].value]) || [],
    tree: nodes,
  });

  useEffect(() => {
    input.onChange(treeState.checked);
  }, [treeState.checked]);

  return (
    <div className="checkbox-tree-wrapper">
      {isRequired ? <span className="checkbox-tree-required-tag">*</span> : undefined}
      <p className="checkbox-tree-title">{label}</p>
      <CheckboxTree
        icons={carbonIcons}
        nodes={nodes}
        checked={treeState.checked}
        expanded={treeState.expanded}
        onCheck={(checked) => {
          setTreeState({ ...treeState, checked });
        }}
        onExpand={(expanded) => setTreeState({ ...treeState, expanded })}
      />
    </div>
  );
};

CheckboxTreeComponent.propTypes = {
  label: PropTypes.string.isRequired,
  nodes: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  checked: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  isRequired: PropTypes.bool,
};

CheckboxTreeComponent.defaultProps = {
  nodes: {},
  checked: [],
  isRequired: false,
};

export default CheckboxTreeComponent;
