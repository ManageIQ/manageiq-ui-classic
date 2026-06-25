import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Checkbox,
  InlineNotification,
} from '@carbon/react';

const DriftHistory = ({ timestamps }) => {
  const [selectedRows, setSelectedRows] = useState([]);

  // Parse timestamps if it's a JSON string
  const parsedTimestamps = useMemo(() => (typeof timestamps === 'string' ? JSON.parse(timestamps) : timestamps), [timestamps]);

  const rows = useMemo(() => {
  // Reverse timestamps to show newest first
    const reversedTimestamps = [...parsedTimestamps].reverse();
    return reversedTimestamps.map((ts, idx) => {
      const checkboxIndex = parsedTimestamps.length - 1 - idx;
      return {
        id: String(checkboxIndex),
        timestamp: `${ts.formatted} (${ts.relative})`,
      };
    });
  }, [parsedTimestamps]);

  // Show empty state if no timestamps
  if (!parsedTimestamps?.length) {
    return (
      <InlineNotification
        kind="warning"
        title={__('No drift history found')}
        subtitle={__('An Analysis or Virtual Black Box Synchronization for this VM may need to be run.')}
        lowContrast
        hideCloseButton
      />
    );
  }

  const handleCheckboxChange = (index, event) => {
    const { checked } = event.target;
    let newSelectedRows = [...selectedRows];

    if (checked) {
      newSelectedRows.push(index);
    } else {
      newSelectedRows = newSelectedRows.filter((id) => id !== index);
    }

    setSelectedRows(newSelectedRows);

    // Trigger button update for toolbar - pass the event target (checkbox)
    if (window.miqUpdateButtons) {
      window.miqUpdateButtons(event.target, 'center_tb');
    }
  };

  const headers = [
    { key: 'timestamp', header: __('Timestamp') },
  ];

  return (
    <div className="drift-history-table">
      <DataTable rows={rows} headers={headers}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getTableContainerProps,
        }) => (
          <div {...getTableContainerProps()}>
            <Table {...getTableProps()} className="table table-bordered table-striped">
              <TableHead>
                <TableRow>
                  <TableHeader className="drift-history-checkbox-cell" />
                  {headers.map((header) => (
                    <TableHeader key={header.key} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const checkboxIndex = parseInt(row.id, 10);
                  const isChecked = selectedRows.includes(checkboxIndex);

                  return (
                    <TableRow key={row.id} {...getRowProps({ row })}>
                      <TableCell className="drift-history-checkbox-cell">
                        <Checkbox
                          id={`check_${checkboxIndex}`}
                          name={`check_${checkboxIndex}`}
                          labelText=""
                          checked={isChecked}
                          value="1"
                          onChange={(e) => handleCheckboxChange(checkboxIndex, e)}
                        />
                      </TableCell>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </DataTable>
    </div>
  );
};

DriftHistory.propTypes = {
  timestamps: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.shape({
      formatted: PropTypes.string.isRequired,
      relative: PropTypes.string.isRequired,
    })),
  ]).isRequired,
};

export default DriftHistory;
