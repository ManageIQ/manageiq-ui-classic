import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from './main-menu';
import { menuProps, RecursiveMenuProps } from './recursive-props';
import { getHrefByType, handleUnsavedChanges } from './helpers';

const TopLevel = ({
  level,
  id,
  title,
  iconClass,
  href,
  active,
  items,
  type,
}) => (
  <li className={`${active ? 'active' : ''} list-group-item secondary-nav-item-pf`} data-target={`#menu-${id}`}>
    <a
      href={getHrefByType(type, href, id)}
      onMouseDown={() => handleUnsavedChanges(type)}
      target={type === 'new_window' ? '_blank' : '_self'}
    >
      <span className={iconClass} />
      <span className="list-group-item-value">{title}</span>
    </a>
    {items.length > 0 && (
    <React.Fragment>
      <div className="nav-pf-secondary-nav" id={`#menu-${id}`}>
        <div className="nav-item-pf-header">
          <a className="secondary-collapse-toggle-pf" data-toggle="collapse-secondary-nav" />
          <span>{title}</span>
        </div>
        <ul className="list-group">
          {items.map(props => <MenuItem key={props.id} level={level + 1} {...props} />)}
        </ul>
      </div>
    </React.Fragment>
    )}
  </li>
);

TopLevel.propTypes = {
  ...menuProps,
  items: PropTypes.arrayOf(PropTypes.shape({
    ...menuProps,
    items: PropTypes.arrayOf(PropTypes.shape(RecursiveMenuProps())),
  })),
};

TopLevel.defaultProps = {
  items: [],
};

export default TopLevel;
