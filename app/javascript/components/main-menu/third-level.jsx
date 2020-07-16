import React from 'react';
import ClassNames from 'classnames';
import { menuProps } from './recursive-props';
import { itemId, linkProps } from '../../menu/item-type';

const ThirdLevel = ({
  id,
  title,
  href,
  active,
  visible,
  type,
}) => (!visible ? null : (
  <li
    id={itemId(id)}
    className={ClassNames(
      'menu-list-group-item',
      {
        active,
      },
    )}
  >
    <a {...linkProps({ type, href, id })}>
      <span className="list-group-item-value">{__(title)}</span>
    </a>
  </li>
));

ThirdLevel.propTypes = {
  ...menuProps,
};

export default ThirdLevel;
