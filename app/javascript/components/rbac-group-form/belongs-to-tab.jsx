import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import CheckboxTree from 'react-checkbox-tree';
import { Button } from '@carbon/react';
import {
  AssemblyCluster,
  Building,
  CheckboxChecked,
  Checkbox,
  CheckboxCheckedFilled,
  ChevronRight,
  ChevronDown,
  DataBase,
  DataCenter,
  Document,
  Folder,
  FolderOpen,
  InfrastructureClassic,
  Template,
  VirtualMachine,
} from '@carbon/react/icons';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';

const carbonIcons = {
  check: <CheckboxCheckedFilled />,
  uncheck: <Checkbox />,
  halfCheck: <CheckboxChecked />,
  expandClose: <ChevronRight />,
  expandOpen: <ChevronDown />,
  parentClose: <Folder />,
  parentOpen: <FolderOpen />,
  leaf: <Document />,
};

// Maps pficon/fa CSS class strings (from bs_tree node.icon) to Carbon icon elements.
// Covers every icon used by TreeBuilderBelongsToHac and TreeBuilderBelongsToVat.
const PFICON_TO_CARBON = {
  'pficon pficon-folder-close': <Folder />,
  'pficon pficon-folder-close-blue': <Folder style={{ fill: '#0099cc' }} />,
  'pficon pficon-virtual-machine': <VirtualMachine />,
  'pficon pficon-template': <Template />,
  'pficon pficon-server': <InfrastructureClassic />,
  'pficon pficon-cluster': <AssemblyCluster />,
  'pficon pficon-container-node': <DataCenter />,
  'fa fa-building-o': <Building />,
  'fa fa-database': <DataBase />,
};

// Resolves the best icon for a bs_tree node.
// 1. If the node has a vendor SVG image URL (providers), render it as an <img>.
// 2. If the node has a pficon/fa icon class string, map it to a Carbon icon.
// 3. Otherwise return null and let react-checkbox-tree use the default parent/leaf icon.
const resolveNodeIcon = (node) => {
  if (node.image) {
    return <img src={node.image} alt="" className="belongs-to-tab__node-icon" />;
  }
  return PFICON_TO_CARBON[node.icon] || null;
};

// Returns all non-disabled node values in the tree (for Select All).
const getAllValues = (nodeList) => {
  let vals = [];
  nodeList.forEach((n) => {
    if (!n.disabled) {
      vals.push(n.value);
    }
    if (n.children) {
      vals = vals.concat(getAllValues(n.children));
    }
  });
  return vals;
};

// Returns all parent (branch) node values in the tree (for expanding on Select All).
const getAllParentValues = (nodeList) => {
  let vals = [];
  nodeList.forEach((n) => {
    if (n.children) {
      vals.push(n.value);
      vals = vals.concat(getAllParentValues(n.children));
    }
  });
  return vals;
};

// Convert bs_tree node format {key, text, icon, image, nodes} to react-checkbox-tree format
const convertNodes = (nodes) => {
  if (!nodes) {
    return [];
  }
  return nodes.map((node) => ({
    value: node.key || node.value,
    label: node.text || node.label,
    icon: resolveNodeIcon(node),
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
        <div className="belongs-to-tab__actions">
          <Button
            kind="ghost"
            size="sm"
            onClick={() => {
              setExpanded(getAllParentValues(nodes));
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
        checkModel="all"
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
