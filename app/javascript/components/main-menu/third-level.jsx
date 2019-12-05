import React from 'react';
import ClassNames from 'classnames';
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
  <li
    id={`menu_item_${id}`}
    className={ClassNames(
      'menu-list-group-item',
      {
        active,
      },
    )}
  >
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
