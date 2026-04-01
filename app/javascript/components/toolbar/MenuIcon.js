/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import { carbonizeIcon } from '../../menu/icon';

export const MenuIcon = (props) => {
  const IconElement = props.icon ? carbonizeIcon(props.icon, { className: 'carbon-icon' }) : null;

  return (
    <div className="miq-toolbar-option-text-with-icon">
      {IconElement && <IconElement color={props.color} />}
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
