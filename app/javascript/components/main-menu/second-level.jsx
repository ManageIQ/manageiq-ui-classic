import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from './main-menu';
import { menuProps } from './recursive-props';

const SecondLevel = ({
  id,
  title,
  href,
  items,
  level,
}) => (
  <li className={`list-group-item ${items.length > 0 ? 'tertiary-nav-item-pf' : ''}`} data-target={`#menu-${id}`}>
    <a href={href}>
      <span className="list-group-item-value">{title}</span>
    </a>
    <div className="nav-pf-tertiary-nav">
      <div className="nav-item-pf-header">
        <a className="tertiary-collapse-toggle-pf" data-toggle="collapse-tertiary-nav" />
        <span>{title}</span>
      </div>
      {items.length > 0 && (
      <ul className="list-group">
        {items.map(props => <MenuItem key={props.id} level={level + 1} {...props} />)}
      </ul>
      )}
    </div>
  </li>
);

SecondLevel.propTypes = {
  ...menuProps,
  items: PropTypes.arrayOf(PropTypes.shape({
    ...menuProps,
  })),
};

SecondLevel.defaultProps = {
  items: [],
};

export default SecondLevel;
