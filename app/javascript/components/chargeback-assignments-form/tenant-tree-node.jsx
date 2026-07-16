import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown } from '@carbon/react';
import { ChevronDown, ChevronRight } from '@carbon/react/icons';

const TenantTreeNode = ({
  tenant, rates, assignments, onRateChange, level,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = tenant.children && tenant.children.length > 0;

  return (
    <div className="tenant-tree-node">
      <div className="node-content">
        <div className="node-name" style={{ paddingLeft: `${level * 2}rem` }}>
          {hasChildren && (
            <Button
              kind="ghost"
              size="sm"
              hasIconOnly
              renderIcon={isExpanded ? ChevronDown : ChevronRight}
              iconDescription={isExpanded ? __('Collapse') : __('Expand')}
              onClick={() => setIsExpanded(!isExpanded)}
              className="expand-button"
            />
          )}
          {!hasChildren && <span className="no-children" />}
          <span className="tenant-name">{tenant.name}</span>
        </div>
        <div className="node-dropdown">
          <Dropdown
            id={`rate-${tenant.id}`}
            items={rates}
            selectedItem={rates.find((r) => r.value === (assignments[tenant.id] || 'nil'))}
            itemToString={(item) => item?.label || ''}
            onChange={({ selectedItem }) => onRateChange(tenant.id, selectedItem?.value || 'nil')}
            label={__('Select rate')}
            size="sm"
          />
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="node-children">
          {tenant.children.map((child) => (
            <TenantTreeNode
              key={child.id}
              tenant={child}
              rates={rates}
              assignments={assignments}
              onRateChange={onRateChange}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

TenantTreeNode.propTypes = {
  tenant: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.array,
  }).isRequired,
  rates: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  assignments: PropTypes.objectOf(PropTypes.string).isRequired,
  onRateChange: PropTypes.func.isRequired,
  level: PropTypes.number.isRequired,
};

export default TenantTreeNode;
