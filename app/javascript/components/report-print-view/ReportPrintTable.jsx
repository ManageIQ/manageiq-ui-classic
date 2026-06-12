import PropTypes from 'prop-types';

const ReportPrintTable = ({ report, data }) => (
  <div className="cds--data-table-content miq_table_pdf">
    <table className="cds--data-table cds--data-table--normal cds--data-table--no-border miq-data-table miq_report">
      <thead>
        <tr>
          {report.headers.map((header) => (
            <th key={header}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => {
          // Create a unique key from the row data
          const rowKey = JSON.stringify(row);
          return (
            <tr key={rowKey}>
              {row.map((cell) => (
                <td key={`${rowKey}-${cell}`}>
                  {cell !== null && cell !== undefined ? cell : ''}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

ReportPrintTable.propTypes = {
  report: PropTypes.shape({
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    col_order: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])).isRequired,
    column_is_hidden: PropTypes.arrayOf(PropTypes.bool),
  }).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.array])
  ).isRequired,
};

export default ReportPrintTable;
