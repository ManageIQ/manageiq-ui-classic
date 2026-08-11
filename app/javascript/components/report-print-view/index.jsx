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

const ReportPrintView = ({ report, data }) => {
  const headers = report.headers.map((header) => ({ key: header, header }));

  const rows = data.map((row, rowIndex) => ({
    id: rowIndex.toString(),
    ...report.headers.reduce((acc, header, colIndex) => {
      acc[header] = row[colIndex] !== null && row[colIndex] !== undefined ? row[colIndex] : '';
      return acc;
    }, {}),
  }));

  return (
    <div className="report-print-view">
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
          </Table>
        )}
      </DataTable>
    </div>
  );
};

ReportPrintView.propTypes = {
  report: PropTypes.shape({
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    col_order: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
    column_is_hidden: PropTypes.arrayOf(PropTypes.bool),
    title: PropTypes.string,
  }).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.array])
  ).isRequired,
};

export default ReportPrintView;
