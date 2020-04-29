import React from 'react';
import { Dropdown, Icon, MenuItem } from 'patternfly-react';
import PropTypes from 'prop-types';

const UserOptions = ({
  currentUser, applianceName, miqGroups, currentGroup,
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
                    miqChangeGroup(group.id);
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

const groupProps = {
  description: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

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
};

export default UserOptions;
