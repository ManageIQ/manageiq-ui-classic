import React from 'react';
import { menuProps } from './recursive-props';
import { getHrefByType, handleUnsavedChanges } from './helpers';
import getTargetByType from '../../helpers/get-target-by-type';

const ThirdLevel = ({
  id,
  title,
  href,
  active,
  visible,
  type,
}) => (!visible ? null : (
  <li className={`menu-list-group-item ${active ? 'active' : ''}`} id={`menu_item_${id}`}>
    <a
      href={getHrefByType(type, href, id)}
      onClick={(event) => {
        if (handleUnsavedChanges(type) === false) {
          event.preventDefault();
        }
        return false;
      }}
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
