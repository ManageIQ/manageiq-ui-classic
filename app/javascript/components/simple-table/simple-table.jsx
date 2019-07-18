import React from 'react';
import PropTypes from 'prop-types';

export const Table = ({ children, ...props }) => <table {...props}>{children}</table>;

Table.propTypes = {
  className: PropTypes.string,
};

Table.defaultProps = {
  className: 'table dataTable table-striped table-bordered table-hover',
};

export const TableHead = ({ children, ...props }) => <thead {...props}>{children}</thead>;

export const TableBody = ({ children, ...props }) => <tbody {...props}>{children}</tbody>;

export const TableRow = ({ children, ...props }) => <tr {...props}>{children}</tr>;

export const TableHeading = ({ children, ...props }) => <th {...props}>{children}</th>;

export const TableCell = ({ children, ...props }) => <td {...props}>{children}</td>;

export const DataDrivenTable = ({
  columns,
  rows,
  id,
  ...props
}) => {
  const generatedRows = rows.map((row, index) => (
    <TableRow key={`row-${index}`}>
      {columns.map(([key, _content, props = {}], index) => <TableCell {...props} key={`${index}-${key}`}>{row[key]}</TableCell>)}
    </TableRow>
  ));
  return (
    <Table id={id} {...props}>
      <TableHead>
        <TableRow>
          {columns.map(([key, content, props = {}]) => (
            <TableHeading {...props} key={key}>{content}</TableHeading>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {generatedRows}
      </TableBody>
    </Table>
  );
};

DataDrivenTable.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  id: PropTypes.string,
};
