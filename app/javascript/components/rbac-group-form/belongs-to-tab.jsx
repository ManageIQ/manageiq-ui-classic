import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import CheckboxTree from 'react-checkbox-tree';
import { Button } from '@carbon/react';
import {
  CheckboxChecked,
  Checkbox,
  CheckboxCheckedFilled,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
} from '@carbon/react/icons';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';

const carbonIcons = {
  check: <span><CheckboxCheckedFilled /></span>,
  uncheck: <span><Checkbox /></span>,
  halfCheck: <span><CheckboxChecked /></span>,
  expandClose: <span><ChevronRight /></span>,
  expandOpen: <span><ChevronDown /></span>,
  parentClose: <span><Folder /></span>,
  parentOpen: <span><FolderOpen /></span>,
};

// Convert bs_tree node format {key, text, nodes} to react-checkbox-tree format {value, label, children}
const convertNodes = (nodes) => {
  if (!nodes) {
    return [];
  }
  return nodes.map((node) => ({
    value: node.key || node.value,
    label: node.text || node.label,
    children: node.nodes && node.nodes.length > 0 ? convertNodes(node.nodes) : undefined,
    showCheckbox: !node.hideCheckbox,
    disabled: node.checkable === false,
  }));
};

const BelongsToTab = ({
  bsTree,
  checked,
  onCheckedChange,
  readOnly,
  superAdminUser,
  limitedMessage,
}) => {
  const nodes = useMemo(() => {
    if (!bsTree) {
      return [];
    }
    try {
      return convertNodes(JSON.parse(bsTree));
    } catch (_e) {
      return [];
    }
  }, [bsTree]);

  const [expanded, setExpanded] = useState(
    nodes.length > 0 ? [nodes[0].value] : []
  );

  if (!nodes || nodes.length === 0) {
    return <p>{__('No items available.')}</p>;
  }

  return (
    <div className="belongs-to-tab">
      {!superAdminUser && limitedMessage && (
        <p>{limitedMessage}</p>
      )}
      {!readOnly && (
        <div style={{ marginBottom: '0.5rem' }}>
          <Button
            kind="ghost"
            size="sm"
            onClick={() => {
              const getAllValues = (nodeList) => {
                let vals = [];
                nodeList.forEach((n) => {
                  if (!n.disabled && n.showCheckbox !== false) {
                    vals.push(n.value);
                  }
                  if (n.children) {
                    vals = vals.concat(getAllValues(n.children));
                  }
                });
                return vals;
              };
              onCheckedChange(getAllValues(nodes));
            }}
          >
            {__('Select All')}
          </Button>
          <Button
            kind="ghost"
            size="sm"
            onClick={() => onCheckedChange([])}
          >
            {__('Deselect All')}
          </Button>
        </div>
      )}
      <CheckboxTree
        icons={carbonIcons}
        nodes={nodes}
        checked={checked}
        expanded={expanded}
        onCheck={readOnly ? () => {} : onCheckedChange}
        onExpand={setExpanded}
        disabled={readOnly}
      />
    </div>
  );
};

BelongsToTab.propTypes = {
  bsTree: PropTypes.string,
  checked: PropTypes.arrayOf(PropTypes.string).isRequired,
  onCheckedChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  superAdminUser: PropTypes.bool,
  limitedMessage: PropTypes.string,
};

export default BelongsToTab;
