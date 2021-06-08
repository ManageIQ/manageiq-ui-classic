import * as React from 'react';
import PropTypes from 'prop-types';

export default function EmptyGroup(props) {
  const { title, text } = props;
  return (
    <table className="table table-bordered table-striped table-summary-screen">
      <thead>
        <tr>
          <th>{title}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{text}</td>
        </tr>
      </tbody>
    </table>
  );
}

EmptyGroup.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};
