/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';

export const MenuIcon = (props) => (
  <div>
    { props.icon && <i className={props.icon} style={{ color: props.color }} /> }
    {' '}
    <span>{ props.text }</span>
  </div>
);

MenuIcon.propTypes = {
  text: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
};

MenuIcon.defaultProps = {
  color: null,
  text: null,
  icon: null,
};
