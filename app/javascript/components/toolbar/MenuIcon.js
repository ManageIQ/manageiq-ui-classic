/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import { carbonizeIcon } from '../../menu/icon';

export const MenuIcon = (props) => (
  <div>
    { props.icon && carbonizeIcon(props.icon, { color: props.color }) }
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
