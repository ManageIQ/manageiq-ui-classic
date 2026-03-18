/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import { carbonizeIcon } from '../../menu/icon';

export const MenuIcon = (props) => {
  let IconElement;
  if (props.icon) {
    IconElement = carbonizeIcon(props.icon, { className: 'carbon-icon' });
  }
  return (
    <div className="miq-toolbar-option-text-with-icon">
      {props.icon ? <IconElement color={props.color} /> : undefined}
      <span>{ props.text }</span>
    </div>
  );
};

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
