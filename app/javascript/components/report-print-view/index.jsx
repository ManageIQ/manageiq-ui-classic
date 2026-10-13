import PropTypes from 'prop-types';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';

const carbonHeaders = (headers) => headers.map((header) => ({ key: header, header }));

const buildRows = (rawRows, headers, startIndex = 0) => rawRows.map((row, i) => ({
  id: (startIndex + i).toString(),
  ...headers.reduce((acc, header, colIndex) => {
    acc[header] = row[colIndex] !== null && row[colIndex] !== undefined ? row[colIndex] : '';
    return acc;
  }, {}),
}));

const ReportTable = ({
  headers, rows, label = undefined, count = undefined,
}) => (
  <DataTable rows={rows} headers={headers}>
    {({
      rows: tableRows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps,
    }) => (
      <Table {...getTableProps()} className="miq-data-table miq_report miq_table_pdf">
        <TableHead>
          <TableRow>
            {tableHeaders.map((header) => {
              const { key, ...headerProps } = getHeaderProps({ header });
              return (
                <TableHeader key={key} {...headerProps}>
                  {header.header}
                </TableHeader>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableRows.map((row) => {
            const { key, ...rowProps } = getRowProps({ row });
            return (
              <TableRow key={key} {...rowProps}>
                {row.cells.map((cell) => (
                  <TableCell key={cell.id}>{cell.value}</TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
        {count !== undefined && (
          <tfoot className="report-print-group-count">
            <tr>
              <td colSpan={tableHeaders.length}>
                <strong>{`${label} | Count: ${count}`}</strong>
              </td>
            </tr>
          </tfoot>
        )}
      </Table>
    )}
  </DataTable>
);

ReportTable.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string, header: PropTypes.string })).isRequired,
  rows: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })).isRequired,
  label: PropTypes.string,
  count: PropTypes.number,
};

const ReportPrintView = ({ report, data }) => {
  const headers = carbonHeaders(report.headers);

  // Determine the grouping column index. Grouping is active when `report.group`
  // is present and `report.sortby` has at least one entry.
  const groupColIndex = report.group && report.sortby && report.sortby.length > 0
    ? report.col_order.indexOf(report.sortby[0])
    : -1;

  if (groupColIndex < 0) {
    // No grouping — render a single table.
    const rows = buildRows(data, report.headers);
    return (
      <div className="report-print-view">
        <ReportTable headers={headers} rows={rows} />
      </div>
    );
  }

  // Group the flat data array by the value at the group column index.
  const groups = [];
  const groupIndex = {};
  data.forEach((row) => {
    const groupLabel = row[groupColIndex] !== null && row[groupColIndex] !== undefined
      ? String(row[groupColIndex])
      : '';
    if (groupIndex[groupLabel] === undefined) {
      groupIndex[groupLabel] = groups.length;
      groups.push({ label: groupLabel, rows: [] });
    }
    groups[groupIndex[groupLabel]].rows.push(row);
  });

  // Build a running offset so row `id` values are unique across all DataTables.
  let offset = 0;
  return (
    <div className="report-print-view">
      {groups.map(({ label, rows: groupRows }) => {
        const tableRows = buildRows(groupRows, report.headers, offset);
        offset += groupRows.length;
        return (
          <div key={label} className="report-print-group">
            <ReportTable headers={headers} rows={tableRows} label={label} count={groupRows.length} />
          </div>
        );
      })}
      <div id="report-print-all-rows-count">
        <strong>{`All Rows | Count: ${data.length}`}</strong>
      </div>
    </div>
  );
};

ReportPrintView.propTypes = {
  report: PropTypes.shape({
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    col_order: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])).isRequired,
    column_is_hidden: PropTypes.arrayOf(PropTypes.bool),
    title: PropTypes.string,
    group: PropTypes.string,
    sortby: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.array])
  ).isRequired,
};

export default ReportPrintView;
