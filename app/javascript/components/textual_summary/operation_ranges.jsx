import * as React from 'react';
import PropTypes from 'prop-types';
import MiqStructuredList from '../miq-structured-list';

export default function OperationRanges(props) {
  const renderItem = (item, i) => (
    <React.Fragment key={i}>
      <tr>
        <td rowSpan={item.value.length + 1}>{item.label}</td>
        <th>&nbsp;</th>
        <th>&nbsp;</th>
      </tr>
      {item.value.map((subitem, j) => (
        // eslint-disable-next-line react/no-array-index-key
        <tr key={j}>
          <td>{subitem.label}</td>
          <td>{subitem.value}</td>
        </tr>
      ))}
    </React.Fragment>
  );

  const { title, items } = props;

  return (
    <>
      <MiqStructuredList
        rows={items}
        title={title}
        mode="operation_ranges"
      />
      <table className="table table-bordered table-striped table-summary-screen operation_ranges">
        <thead>
          <tr>
            <th colSpan="3" align="left">{title}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => renderItem(item, i))}
        </tbody>
      </table>
    </>
  );
}

OperationRanges.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};
