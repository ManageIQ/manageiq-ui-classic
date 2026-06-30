import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Dropdown,
  Layer,
} from '@carbon/react';
import { ChevronRight, ChevronDown } from '@carbon/react/icons';

const TenantTree = ({
  tenants, rates, assignments, onRateChange,
}) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  if (!tenants || tenants.length === 0) {
    return (
      <div className="empty-state">
        <p>{__('No tenants available.')}</p>
      </div>
    );
  }

  // Flatten tenant tree into rows with parent-child relationships
  const flattenTenants = (tenantList, level = 0, parentId = null) => {
    const result = [];
    tenantList.forEach((tenant) => {
      result.push({
        id: tenant.id.toString(),
        name: tenant.name,
        level,
        parentId,
        hasChildren: tenant.children && tenant.children.length > 0,
        children: tenant.children || [],
      });
      // Only include children if parent is expanded
      if (tenant.children && tenant.children.length > 0 && expandedNodes.has(tenant.id.toString())) {
        result.push(...flattenTenants(tenant.children, level + 1, tenant.id.toString()));
      }
    });
    return result;
  };

  const flatTenants = flattenTenants(tenants);

  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const headers = [
    { key: 'name', header: __('Name') },
    { key: 'rate', header: __('Rate') },
  ];

  const rows = flatTenants.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    rate: tenant.id,
  }));

  return (
    <DataTable rows={rows} headers={headers} useZebraStyles>
      {({
        rows: dataRows,
        headers: dataHeaders,
        getTableProps,
        getHeaderProps,
        getRowProps,
      }) => (
        <Table {...getTableProps()} aria-label={__('Tenant chargeback assignments')}>
          <TableHead>
            <TableRow>
              {dataHeaders.map((header) => (
                <TableHeader {...getHeaderProps({ header })} key={header.key}>
                  {header.header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {dataRows.map((row) => {
              const tenant = flatTenants.find((t) => t.id === row.id);
              if (!tenant) {
                return null;
              }

              const isExpanded = expandedNodes.has(row.id);
              return (
                <TableRow {...getRowProps({ row })} key={row.id}>
                  <TableCell style={{ paddingLeft: `${tenant.level * 2 + 0.5}rem` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {tenant.hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleNode(row.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          aria-label={isExpanded ? __('Collapse') : __('Expand')}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      ) : (
                        <span style={{ width: '16px', display: 'inline-block' }} />
                      )}
                      <span>{row.cells[0].value}</span>
                    </div>
                  </TableCell>
                  <TableCell className="dropdown-cell-wrapper">
                    <Layer>
                      <Dropdown
                        id={`rate-${row.id}`}
                        type="inline"
                        items={rates}
                        selectedItem={rates.find((r) => r.value === String(assignments[row.id] || 'nil'))}
                        itemToString={(item) => item?.label || ''}
                        onChange={({ selectedItem }) => onRateChange(row.id, selectedItem?.value || 'nil')}
                        label={__('Select rate')}
                        size="sm"
                        menuPosition="fixed"
                      />
                    </Layer>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </DataTable>
  );
};

TenantTree.propTypes = {
  tenants: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.array,
  })).isRequired,
  rates: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  assignments: PropTypes.objectOf(PropTypes.string).isRequired,
  onRateChange: PropTypes.func.isRequired,
};

export default TenantTree;
