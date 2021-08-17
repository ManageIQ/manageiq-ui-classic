/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import PropTypes from 'prop-types';

export default function SimpleTable(props) {
  const renderLabel = (label) => {
    if ((typeof label === 'object') && label.sortable) {
      const sortClass = label.sortable === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc';
      return (
        <>
          <div className="pull-left">{label.value}</div>
          <div className="pull-right">
            <i className={sortClass} />
          </div>
        </>
      );
    }
    return label;
  };

  const renderValue = (value, j, onClick) => {
    if ((value != null) && (typeof value === 'object') && value.expandable) {
      // expandable value
      return (
        <td key={j}>
          <div className="pull-left expand">{value.value}</div>
          <div className="pull-right" />
        </td>
      );
    } if ((value != null) && (typeof value === 'object') && value.link) {
      // value with a link
      return <td key={j} className="btn-link"><a href={value.link} onClick={(e) => onClick(value, e)}>{value.value}</a></td>;
    }
    // simple value
    return <td className="no-hover" key={j}>{value}</td>;
  };

  const renderRow = (row, i, onClick) => <tr key={i}>{row.map((value, j) => renderValue(value, j, onClick))}</tr>;

  const { rows, labels, title } = props;

  return (
    <table className="table table-bordered table-hover table-striped table-summary-screen">
      <thead>
        <tr>
          <th colSpan={labels.length} align="left">{title}</th>
        </tr>
        <tr>
          {labels.map((label, i) => <td style={{ wordBreak: 'initial' }} key={i}><strong>{renderLabel(label)}</strong></td>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => renderRow(row, i, props.onClick))}
      </tbody>
    </table>
  );
}

SimpleTable.propTypes = {
  title: PropTypes.string.isRequired,
  labels: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ value: PropTypes.string.isRequired, sortable: PropTypes.string }),
  ])).isRequired,
  rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
  onClick: PropTypes.func.isRequired,
};
