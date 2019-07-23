import React from 'react';
import { menuProps } from './recursive-props';

const ThirdLevel = ({
  id,
  title,
  href,
  active,
  visible,
}) => (!visible ? null : (
  <li className={`list-group-item ${active ? 'active' : ''}`} id={`menu_item_${id}`}>
    <a href={href}>
      <span className="list-group-item-value">{title}</span>
    </a>
  </li>
));

ThirdLevel.propTypes = {
  ...menuProps,
};

export default ThirdLevel;
