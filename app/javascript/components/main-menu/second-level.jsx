import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from './main-menu';
import { menuProps } from './recursive-props';
import {
  getHrefByType, getIdByCategory, getTargetByType, handleUnsavedChanges,
} from './helpers';

const SecondLevel = ({
  id,
  title,
  href,
  items,
  level,
  type,
  active,
}) => (
  <li className={`menu-list-group-item ${items.length > 0 ? 'tertiary-nav-item-pf' : ''} ${active ? 'active' : ''}`} data-target={`#menu-${id}`} id={getIdByCategory(items.length > 0, id)}>
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
    <div className="nav-pf-tertiary-nav">
      <div className="nav-item-pf-header">
        <a className="tertiary-collapse-toggle-pf" data-toggle="collapse-tertiary-nav">
          <span>{title}</span>
        </a>
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
