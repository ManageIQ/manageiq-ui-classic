import React from 'react';
import PropTypes from 'prop-types';

const List = ({ value, optionClick, ...rest }) => (
  <select
    multiple
    className="form-control list"
    {...rest}
  >
    {value.map(({ key, label }) => (
      <option onClick={optionClick} key={key} value={key}>
        {label}
      </option>
    ))}
  </select>
);

List.propTypes = {
  value: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  optionClick: PropTypes.func.isRequired,
};

List.defaultProps = {
  value: [],
};

export default List;
