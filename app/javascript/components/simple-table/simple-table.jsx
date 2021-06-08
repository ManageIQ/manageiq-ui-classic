/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';

export const Table = ({ children, ...props }) => <table {...props}>{children}</table>;

Table.propTypes = {
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
};

Table.defaultProps = {
  className: 'table dataTable table-striped table-bordered table-hover',
};

export const TableHead = ({ children, ...props }) => <thead {...props}>{children}</thead>;

TableHead.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
};

export const TableBody = ({ children, ...props }) => <tbody {...props}>{children}</tbody>;

TableBody.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
};

export const TableRow = ({ children, ...props }) => <tr {...props}>{children}</tr>;

TableRow.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
};

export const TableHeading = ({ children, ...props }) => <th {...props}>{children}</th>;

TableHeading.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
};

export const TableCell = ({ children, ...props }) => <td {...props}>{children}</td>;

TableCell.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
};

export const DataDrivenTable = ({
  columns,
  rows,
  id,
  transform,
  ...props
}) => {
  const generatedRows = rows.map(transform).map((row, index) => {
    const handleClick = (e) => {
      if (!row.$onClick) {
        return;
      }

      row.$onClick(e);
      e.preventDefault();
      e.stopPropagation();
    };

    return (
      <TableRow key={`row-${index}`} onClick={handleClick}>
        {columns.map(([key, _content, props = {}], index) => <TableCell {...props} key={`${index}-${key}`}>{row[key]}</TableCell>)}
      </TableRow>
    );
  });

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
  columns: PropTypes.arrayOf(PropTypes.any).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  id: PropTypes.string,
  transform: PropTypes.func,
};

DataDrivenTable.defaultProps = {
  transform: (row) => row,
  id: undefined,
};
