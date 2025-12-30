import React from 'react';
import PropTypes from 'prop-types';
import * as icons from '@carbon/icons-react';

export const carbonizeIcon = (classname, options = undefined) => {
  const size = (options && options.size) || 20; // Default size is 16px
  console.log(classname);
  console.log(size);

  if (!classname) {
    return null;
  }

  if (!classname.startsWith('carbon--')) {
    if (options && options.color) {
      return <i className={classname} style={{ color: options.color }} />;
    }
    return <i className={classname} />;
  }

  const name = classname.replace(/^carbon--/, '');
  const key = `${name}${size}`;
  return icons[key];
};

const MiqIcon = ({ icon, size }) => {
  const IconElement = carbonizeIcon(icon, { size });
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
