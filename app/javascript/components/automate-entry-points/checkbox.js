import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Checkbox = ({ defaultState = false, onChange, children }) => {
  const [on, setOn] = useState(defaultState);
  const handleChange = (e) => {
    setOn(e.target.checked);
    onChange(e.target.checked);
  };
  return (
    <form style={{ display: 'inline-block', padding: 10 }}>
      <label htmlFor="checkbox">
        <input type="checkbox" checked={on} onChange={handleChange} />
        {children}
      </label>
    </form>
  );
};

Checkbox.propTypes = {
  defaultState: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.arrayOf(PropTypes.any),
};

Checkbox.defaultProps = {
  defaultState: false,
  children: [],
};

export default Checkbox;
