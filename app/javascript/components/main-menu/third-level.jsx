import React from 'react';
import { menuProps } from './recursive-props';
import { getHrefByType } from './helpers';

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
      onMouseDown={() => {
        window.miqCheckForChanges();
        return type === 'modal' && sendDataWithRx({ type: 'showAboutModal' });
      }}
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
