import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from './main-menu';
import { menuProps, RecursiveMenuProps } from './recursive-props';
import { getHrefByType, getTargetByType, handleUnsavedChanges } from './helpers';

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
  items.length > 0 ? (
    <li className={`${active ? 'active' : ''} menu-list-group-item secondary-nav-item-pf`} data-target={`#menu-${id}`} id={`menu_item_${id}`}>
      <a
        onClick={(event) => {
          if (handleUnsavedChanges(type) === false) {
            event.preventDefault();
          }
          return false;
        }}
        href={getHrefByType(type, href, id)}
        target={getTargetByType(type)}
        className="top-level"
      >
        <span className={iconClass} />
        <span className="list-group-item-value">{title}</span>
      </a>
      <React.Fragment>
        <div className="nav-pf-secondary-nav" id={`menu-${id}`}>
          <div className="nav-item-pf-header">
            <a className="secondary-collapse-toggle-pf top-level" data-toggle="collapse-secondary-nav" >
              <span>{title}</span>
            </a>
          </div>
          <ul className="list-group">
            {items.map(props => <MenuItem key={props.id} level={level + 1} {...props} />)}
          </ul>
        </div>
      </React.Fragment>
    </li>
  ) : (
    <li className={`${active ? 'active' : ''} menu-list-group-item`} id={`menu_item_${id}`}>
      <a
        onClick={(event) => {
          if (handleUnsavedChanges(type) === false) {
            event.preventDefault();
          }
          return false;
        }}
        href={getHrefByType(type, href, id)}
      >
        <span className={iconClass} />
        <span className="list-group-item-value">{title}</span>
      </a>
    </li>
  )
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
