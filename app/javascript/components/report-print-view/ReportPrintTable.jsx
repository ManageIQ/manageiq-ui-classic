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
          const rowKey = row.id || Object.keys(row).filter((key) => key.startsWith('col-')).map((key) => row[key]).join('-');
          return (
            <tr key={rowKey}>
              {Object.keys(row).filter((key) => key.startsWith('col-')).sort().map((key) => (
                <td key={key}>
                  {row[key] || ''}
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
    col_order: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
    column_is_hidden: PropTypes.arrayOf(PropTypes.bool),
  }).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({})
  ).isRequired,
};

export default ReportPrintTable;
