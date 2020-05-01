import React from 'react';
import { Dropdown, MenuItem } from 'patternfly-react';

export const UserOptions = ({ currentUser, applianceName, miqGroups, currentGroup }) => (
  <Dropdown
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
      <i className="pficon pficon-user" />
      <p id="username_display" data-userid={currentUser.userid} className="navbar__user-name">{`${currentUser.name} | ${applianceName}`}</p>
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <MenuItem disabled>{sprintf(__('Server: %s'), applianceName)}</MenuItem>
      { miqGroups.length > 1 ? (
        <li className="dropdown-submenu pull-left">
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
    </Dropdown.Menu>
  </Dropdown>
);
