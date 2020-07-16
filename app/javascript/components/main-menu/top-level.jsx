import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { MenuItem, HoverContext } from './main-menu';
import { menuProps, RecursiveMenuProps } from './recursive-props';
import { itemId, linkProps } from '../../menu/item-type';

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
        id={itemId(id, isSection)}
        onMouseEnter={() => handleSetActiveIds({ topLevelId: id })}
        onBlur={() => undefined}
      >
        <a
          className="top-level-item"
          {...linkProps({ type, href, id })}
        >
          <span className={icon} />
          <span className="list-group-item-value">{__(title)}</span>
        </a>
        <React.Fragment>
          <div className="nav-pf-secondary-nav" id={`menu-${id}`}>
            <div className="nav-item-pf-header">
              <a className="top-level-item">
                <span>{__(title)}</span>
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
      id={itemId(id, isSection)}
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
        {...linkProps({ type, href, id })}
      >
        <span className={icon} />
        <span className="list-group-item-value">{__(title)}</span>
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
