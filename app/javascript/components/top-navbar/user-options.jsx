import React from 'react';
import { Dropdown, Icon, MenuItem } from 'patternfly-react';
import PropTypes from 'prop-types';
import {
  groupProps, recursiveUserMenuProps, userMenuProps,
} from './recursive-props';


const UserOptions = ({
  currentUser, applianceName, miqGroups, currentGroup, userMenu,
}) => (
  <Dropdown
    id="dropdownMenu2"
    componentClass={
      ({ children, ...props }) => (
        <li
          {...props}
          className="dropdown"
        >
          {children}
        </li>
      )}
  >
    <Dropdown.Toggle
      componentClass={
        ({ children, ...props }) => (
          <a
            {...props}
            aria-haspopup="true"
            data-toggle="dropdown"
            className="dropdown-toggle nav-item-iconic"
          >
            {children}
          </a>
        )
      }
    >
      <Icon type="pf" name="user" />
      <p id="username_display" data-userid={currentUser.userid} className="navbar__user-name">{`${currentUser.name} | ${applianceName}`}</p>
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <MenuItem disabled>{sprintf(__('Server: %s'), applianceName)}</MenuItem>
      { miqGroups.length > 1 ? (
        <li id="droptownMenuGroup" className="dropdown-submenu pull-left">
          <Dropdown.Toggle
            useAnchor
            noCaret
            componentClass={
              ({ children }) => (
                <a href="#">
                  {children}
                </a>
              )
            }
          >
                Change Group
          </Dropdown.Toggle>
          <Dropdown.Menu className="scrollable-menu">
            {miqGroups.sort().map(group => (
              (currentGroup).id === group.id ? (
                <MenuItem id="current-group" key={group.id} disabled title={__('Currently Selected Group')}>
                  {`${group.description} (${__('Current Group')})`}
                </MenuItem>
              ) : (
                <MenuItem
                  id={group.description}
                  key={group.id}
                  title={__('Change to this Group')}
                  onClick={(e) => {
                    e.preventDefault();
                    miqChangeGroup(group.id.toString());
                  }}
                >
                  {group.description}
                </MenuItem>
              )))
            }
          </Dropdown.Menu>
        </li>
      ) : (
        <MenuItem id="single-group-item" disabled>{(currentGroup).description}</MenuItem>
      )
      }
      {userMenu.map(section => (
        section.visible && (
          <React.Fragment key={section.id}>
            <MenuItem divider />
            { section.items.map(item => (
              item.visible && (
                <MenuItem
                  id={`user-menu-${item.title.toLowerCase()}`}
                  key={item.id}
                  href={item.href}
                  onClick={event => !miqCheckForChanges() && event.preventDefault()}
                >
                  {item.title}
                </MenuItem>
              )
            ))}
          </React.Fragment>
        )
      ))}
      <MenuItem divider />
      <MenuItem
        id="logout-btn"
        href="/dashboard/logout"
        onClick={(e) => {
          if (miqCheckForChanges()) {
            ManageIQ.logoutInProgress = true;
          } else {
            e.preventDefault();
          }
        }}
        title={__('Click to Logout')}
      >
        {__('Logout')}
      </MenuItem>
    </Dropdown.Menu>
  </Dropdown>
);

UserOptions.propTypes = {
  currentUser: PropTypes.shape({
    name: PropTypes.string.isRequired,
    userid: PropTypes.string.isRequired,
  }).isRequired,
  applianceName: PropTypes.string.isRequired,
  miqGroups: PropTypes.arrayOf(
    PropTypes.shape({
      ...groupProps,
    }).isRequired,
  ).isRequired,
  currentGroup: PropTypes.shape({
    ...groupProps,
  }).isRequired,
  userMenu: PropTypes.arrayOf(PropTypes.shape({
    ...userMenuProps,
    items: PropTypes.arrayOf(PropTypes.shape(recursiveUserMenuProps)),
  })).isRequired,
};

export default UserOptions;
