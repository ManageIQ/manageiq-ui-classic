/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import PropTypes from 'prop-types';
import MiqStructuredList from '../miq-structured-list';

const simpleRow = (row, i, colOrder) => (
  <tr key={i} className="no-hover">
    {colOrder.map((col, j) => <td key={j}>{row[col]}</td>)}
  </tr>
);

const clickableRow = (row, i, colOrder, rowLabel, onClick) => (
  <tr key={i}>
    {colOrder.map((col, j) => (
      <td key={j} title={rowLabel}>
        <a href={row.link} onClick={(e) => onClick(row, e)}>
          {`${row[col]}`}
        </a>
      </td>
    ))}
  </tr>
);

const renderRow = (row, i, colOrder, rowLabel, onClick) => (
  row.link ? clickableRow(row, i, colOrder, rowLabel, onClick) : simpleRow(row, i, colOrder)
);

export default function TableListView(props) {
  const { headers, values, title } = props;

  /** Function to generate heders/rows for the default structured list. */
  const miqListDefaultTable = () => {
    const data = [];
    values.map((item) => data.push({ ...item, label: item.name }));

    return (
      <MiqStructuredList
        headers={headers}
        rows={data}
        title={title}
        mode="table_list_view"
        onClick={() => props.onClick}
      />
    );
  };

  /** Function to generate headers/rows for a complex structured list. e.g. Tenant Quotas */
  const miqListComplexTable = () => {
    const headerKeys = headers.map((item) => (item.key));
    const data = values.map((item) => (headerKeys.map((header) => item[header])));

    return (
      <MiqStructuredList
        headers={headers.map((item) => item.label)}
        rows={data}
        title={title}
        mode="table_list_view"
        onClick={() => props.onClick}
      />
    );
  };

  return !!headers[0].key ? miqListComplexTable() : miqListDefaultTable();
}

TableListView.propTypes = {
  title: PropTypes.string.isRequired,
  headers: PropTypes.arrayOf(PropTypes.any).isRequired,
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func.isRequired,
};
