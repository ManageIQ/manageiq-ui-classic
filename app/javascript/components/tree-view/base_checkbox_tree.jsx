import CheckboxTree from 'react-checkbox-tree';
import PropTypes from 'prop-types';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import {
  CheckboxChecked,
  Checkbox,
  CheckboxCheckedFilled,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
} from '@carbon/react/icons';

export const treeIcons = {
  check: (
    <span>
      <CheckboxCheckedFilled />
    </span>
  ),
  uncheck: (
    <span>
      <Checkbox />
    </span>
  ),
  halfCheck: (
    <span>
      <CheckboxChecked />
    </span>
  ),
  expandClose: (
    <span>
      <ChevronRight />
    </span>
  ),
  expandOpen: (
    <span>
      <ChevronDown />
    </span>
  ),
  parentClose: (
    <span>
      <Folder />
    </span>
  ),
  parentOpen: (
    <span>
      <FolderOpen />
    </span>
  ),
};

const BaseCheckboxTree = ({
  nodes,
  checked = [],
  expanded = [],
  onCheck,
  onExpand,
  onClick = null,
  icons = {},
  noCascade = false,
  showNodeIcon = true,
  showNodeTitle = false,
  expandOnClick = false,
  disabled = false,
  ...props
}) => (
  <CheckboxTree
    {...props}
    icons={{ ...treeIcons, ...icons }}
    nodes={nodes}
    checked={checked}
    expanded={expanded}
    onCheck={onCheck}
    onExpand={onExpand}
    onClick={onClick}
    noCascade={noCascade}
    showNodeIcon={showNodeIcon}
    showNodeTitle={showNodeTitle}
    expandOnClick={expandOnClick}
    disabled={disabled}
  />
);

const valueShape = PropTypes.arrayOf(
  PropTypes.oneOfType([PropTypes.string, PropTypes.number])
);

BaseCheckboxTree.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  checked: valueShape,
  expanded: valueShape,
  onCheck: PropTypes.func.isRequired,
  onExpand: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  icons: PropTypes.shape({}),
  noCascade: PropTypes.bool,
  showNodeIcon: PropTypes.bool,
  showNodeTitle: PropTypes.bool,
  expandOnClick: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default BaseCheckboxTree;
