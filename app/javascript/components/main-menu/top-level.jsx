import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { MenuItem, HoverContext } from './main-menu';
import { menuProps, RecursiveMenuProps } from './recursive-props';
import {
  getHrefByType, getSectionId, handleUnsavedChanges, getItemId,
} from './helpers';
import getTargetByType from '../../helpers/get-target-by-type';

const TopLevel = ({
  level,
  id,
  title,
  icon,
  href,
  active,
  items,
  type,
  handleSetActiveIds,
}) => {
  const isSection = items.length > 0;

  if (isSection) {
    return (
      <li
        className={`${active ? 'active' : ''} menu-list-group-item secondary-nav-item-pf ${useContext(HoverContext).topLevelId === id ? 'is-hover' : ''}`}
        id={getSectionId(id)}
        onMouseEnter={() => handleSetActiveIds({ topLevelId: id })}
        onBlur={() => undefined}
      >
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
          <span className={icon} />
          <span className="list-group-item-value">{title}</span>
        </a>
        <React.Fragment>
          <div className="nav-pf-secondary-nav" id={`menu-${id}`}>
            <div className="nav-item-pf-header">
              <a className="secondary-collapse-toggle-pf top-level" data-toggle="collapse-secondary-nav">
                <span>{title}</span>
              </a>
            </div>
            <ul className="list-group">
              {items.map(props => <MenuItem key={props.id} level={level + 1} handleSetActiveIds={handleSetActiveIds} {...props} />)}
            </ul>
          </div>
        </React.Fragment>
      </li>
    );
  }

  return (
    <li className={`${active ? 'active' : ''} menu-list-group-item`} id={getItemId(id)}>
      <a
        onClick={(event) => {
          if (handleUnsavedChanges(type) === false) {
            event.preventDefault();
          }
          return false;
        }}
        href={getHrefByType(type, href, id)}
      >
        <span className={icon} />
        <span className="list-group-item-value">{title}</span>
      </a>
    </li>
  );
};

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
