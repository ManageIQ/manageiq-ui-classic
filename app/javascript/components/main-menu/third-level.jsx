import React from 'react';
import { menuProps } from './recursive-props';
import { getHrefByType, getTargetByType, handleUnsavedChanges } from './helpers';

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
      onMouseDown={e => handleUnsavedChanges(e, type)}
      target={getTargetByType(type)}
    >
      <span className="list-group-item-value">{title}</span>
    </a>
  </li>
));

ThirdLevel.propTypes = {
  ...menuProps,
};

export default ThirdLevel;
