import PropTypes from 'prop-types';
import ReportPrintTable from './ReportPrintTable';

const ReportPrintView = ({ report, data }) => (
  <div className="report-print-view">
    <ReportPrintTable
      report={report}
      data={data}
    />
  </div>
);

ReportPrintView.propTypes = {
  report: PropTypes.shape({
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    col_order: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
    title: PropTypes.string,
  }).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({})
  ).isRequired,
};

export default ReportPrintView;
