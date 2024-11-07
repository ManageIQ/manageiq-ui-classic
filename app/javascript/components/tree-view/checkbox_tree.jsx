import React, { useState, useEffect } from 'react';
import CheckboxTree from 'react-checkbox-tree';
import PropTypes from 'prop-types';
import { useFieldApi } from '@@ddf';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import {
  CheckboxChecked20, Checkbox20, CheckboxCheckedFilled20, ChevronRight20, ChevronDown20, Folder20, FolderOpen20,
} from '@carbon/icons-react';

const carbonIcons = {
  check: <span><CheckboxCheckedFilled20 color="black" /></span>,
  uncheck: <span><Checkbox20 color="black" /></span>,
  halfCheck: <span><CheckboxChecked20 color="black" /></span>,
  expandClose: <span><ChevronRight20 color="black" /></span>,
  expandOpen: <span><ChevronDown20 color="black" /></span>,
  parentClose: <span><Folder20 color="black" /></span>,
  parentOpen: <span><FolderOpen20 color="black" /></span>,
};

const CheckboxTreeComponent = (props) => {
  const { label, nodes, checked } = props;
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
    <div>
      <p>{label}</p>
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
};

CheckboxTreeComponent.defaultProps = {
  nodes: {},
  checked: [],
};

export default CheckboxTreeComponent;
