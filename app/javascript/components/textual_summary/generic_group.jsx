import * as React from 'react';
import PropTypes from 'prop-types';
import GenericTableRow from './generic_table_row';

export default function GenericGroup(props) {
  return (
    <table className="table table-bordered table-hover table-striped table-summary-screen">
      <thead>
        <tr>
          <th colSpan="2" align="left">{props.title}</th>
        </tr>
      </thead>
      <tbody>
        {
          props.items.map((item, i) => (
            <GenericTableRow onClick={props.onClick} key={i} item={item} />
          ))
        }
      </tbody>
    </table>
  );
}

GenericGroup.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  onClick: PropTypes.func.isRequired,
};
