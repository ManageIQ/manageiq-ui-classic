import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
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
  const hoveredTopLevelId = useContext(HoverContext).topLevelId;
  const isSection = items.length > 0;
  if (isSection) {
    return (
      <li
        className={ClassNames(
          'menu-list-group-item',
          'secondary-nav-item-pf',
          {
            active,
            'is-hover': hoveredTopLevelId === id,
          },
        )}
        id={getSectionId(id)}
        onMouseEnter={() => handleSetActiveIds({ topLevelId: id })}
        onBlur={() => undefined}
      >
        <a
          className="top-level-item"
          href={getHrefByType(type, href, id)}
          onClick={(event) => {
            if (handleUnsavedChanges(type) === false) {
              event.preventDefault();
            }
            return false;
          }}
          target={getTargetByType(type)}
        >
          <span className={icon} />
          <span className="list-group-item-value">{title}</span>
        </a>
        <React.Fragment>
          <div className="nav-pf-secondary-nav" id={`menu-${id}`}>
            <div className="nav-item-pf-header">
              <a className="top-level-item">
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
    <li
      id={getItemId(id)}
      className={ClassNames(
        'menu-list-group-item',
        {
          active,
        },
      )
      }
      onMouseEnter={() => handleSetActiveIds({ topLevelId: undefined })}
      onBlur={() => undefined}
    >
      <a
        className="top-level-item"
        href={getHrefByType(type, href, id)}
        onClick={(event) => {
          if (handleUnsavedChanges(type) === false) {
            event.preventDefault();
          }
          return false;
        }}
        target={getTargetByType(type)}
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
