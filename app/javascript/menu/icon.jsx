import React from 'react';
import PropTypes from 'prop-types';
import * as icons from '@carbon/react/icons';

export const carbonizeIcon = (classname, size = 20) => {
  if (!classname) {
    return null;
  }

  if (!classname.startsWith('carbon--')) {
    return (props) => <i className={classname} {...props} />;
  }

  const name = classname.replace(/^carbon--/, '');
  const IconComponent = icons[name];
  return (props) => <IconComponent size={size} {...props} />;
};

const MiqIcon = ({ icon, size }) => {
  const IconElement = carbonizeIcon(icon, size);
  return <IconElement style={{ marginBottom: '-4px' }} />;
};

MiqIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  size: PropTypes.number,
};

MiqIcon.defaultProps = {
  size: 16,
};

export default MiqIcon;
