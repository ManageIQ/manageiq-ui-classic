/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import PropTypes from 'prop-types';

const simpleRow = (row, i, colOrder) => (
  <tr key={i} className="no-hover">
    {colOrder.map((col, j) => <td key={j}>{row[col]}</td>)}
  </tr>
);

const clickableRow = (row, i, colOrder, rowLabel, onClick) => (
  <a href={row.link} onClick={(e) => onClick(row, e)}>
    <tr key={i}>
      {colOrder.map((col, j) => <td key={j} title={rowLabel}>{`${row[col]}`}</td>)}
    </tr>
  </a>
);

const renderRow = (row, i, colOrder, rowLabel, onClick) => (
  row.link ? clickableRow(row, i, colOrder, rowLabel, onClick) : simpleRow(row, i, colOrder)
);

export default function TableListView(props) {
  const { headers, values, title } = props;
  console.log('values===', values);

  return (
    <table className="table table-bordered table-hover table-striped table-summary-screen table_list_view">
      <thead>
        <tr>
          <th colSpan={headers.length} align="left">{title}</th>
        </tr>
        <tr>
          {headers.map((header, i) => <th key={i}>{header}</th>)}
        </tr>
      </thead>
      <tbody>
        {values.map((row, i) => renderRow(row, i, props.colOrder, props.rowLabel, props.onClick))}
      </tbody>
    </table>
  );
}

TableListView.propTypes = {
  title: PropTypes.string.isRequired,
  headers: PropTypes.arrayOf(PropTypes.string).isRequired,
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
  colOrder: PropTypes.arrayOf(PropTypes.string).isRequired,
  rowLabel: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
