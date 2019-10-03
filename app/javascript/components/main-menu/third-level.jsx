import React from 'react';
import { menuProps } from './recursive-props';
import { getHrefByType, handleUnsavedChanges } from './helpers';

const ThirdLevel = ({
  id,
  title,
  href,
  active,
  visible,
  type,
}) => (!visible ? null : (
  <li className={`list-group-item ${active ? 'active' : ''}`} id={`menu_item_${id}`}>
    <a
      href={getHrefByType(type, href, id)}
      onMouseDown={() => handleUnsavedChanges(type)}
      target={type === 'new_window' ? '_blank' : '_self'}
    >
      <span className="list-group-item-value">{title}</span>
    </a>
  </li>
));

ThirdLevel.propTypes = {
  ...menuProps,
};

export default ThirdLevel;
