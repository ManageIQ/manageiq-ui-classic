import React from 'react';
import PropTypes from 'prop-types';
import { carbonizeIcon } from '../../menu/icon';

const Icon = ({
  text, icon, color, size,
}) => {
  const IconElement = carbonizeIcon(icon, size);
  return (
    <div id="icon">
      <IconElement aria-label={text} className="my-custom-class" color={color} />
      <span className={text}>{text}</span>
    </div>
  );
};

export default Icon;

Icon.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string,
  size: PropTypes.number,
};

Icon.defaultProps = {
  color: 'black',
  size: 16,
};
