import React from 'react';
import * as icons from '@carbon/icons-react';

export const carbonizeIcon = (classname, size = 20) => {
  if (!classname) {
    return null;
  }

  if (!classname.startsWith('carbon--')) {
    return (props) => (<i className={classname} {...props} />);
  }

  let name = classname.replace(/^carbon--/, '');
  let key = `${name}${size}`;
  return icons[key];
};

export const MiqIcon = ({ icon, size = 16 }) => {
  const IconElement = carbonizeIcon(icon, size);
  return <IconElement style={{ marginBottom: '-4px' }} />;
};
