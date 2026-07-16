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

const SimpleList = ({
  resources, rates, assignments, onRateChange,
}) => {
  if (!resources || resources.length === 0) {
    return (
      <div className="empty-state">
        <p>{__('No resources available for this assignment type.')}</p>
      </div>
    );
  }

  const headers = [
    { key: 'name', header: __('Name') },
    { key: 'rate', header: __('Rate') },
  ];

  const rows = resources.map((resource) => ({
    id: resource.id.toString(),
    name: resource.name,
    rate: resource.id,
  }));

  return (
    <DataTable rows={rows} headers={headers} useZebraStyles>
      {({
        rows: dataRows, headers: dataHeaders, getTableProps, getHeaderProps, getRowProps,
      }) => (
        <Table {...getTableProps()} aria-label={__('Chargeback assignments')}>
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
            {dataRows.map((row) => (
              <TableRow {...getRowProps({ row })} key={row.id}>
                <TableCell>{row.cells[0].value}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      )}
    </DataTable>
  );
};

SimpleList.propTypes = {
  resources: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  rates: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  assignments: PropTypes.objectOf(PropTypes.string).isRequired,
  onRateChange: PropTypes.func.isRequired,
};

export default SimpleList;
