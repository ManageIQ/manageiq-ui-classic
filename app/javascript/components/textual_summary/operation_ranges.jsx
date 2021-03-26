import * as React from 'react';
import PropTypes from 'prop-types';

export default function OperationRanges(props) {
  const renderItem = (item, i) => (
    <React.Fragment key={i}>
      <tr>
        <td rowSpan={item.value.length + 1}>{item.label}</td>
        <th>&nbsp;</th>
        <th>&nbsp;</th>
      </tr>
      {item.value.map((subitem, j) => <tr key={j}><td>{subitem.label}</td><td>{subitem.value}</td></tr>)}
    </React.Fragment>
  );

  return (
    <table className="table table-bordered table-striped table-summary-screen">
      <thead>
        <tr>
          <th colSpan="3" align="left">{props.title}</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => renderItem(item, i))}
      </tbody>
    </table>
  );
}

OperationRanges.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};
