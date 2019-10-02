/* global miqCheckForChanges */

import React from 'react';
import { Dropdown, Icon, MenuItem } from 'patternfly-react';
import PropTypes from 'prop-types';
import { helpMenuProps, recursiveHelpMenuProps } from './recursive-props';

const Help = ({
  helpMenu,
}) => (
  helpMenu.map(section => (
    section.visible && (
    <Dropdown
      key={section.id}
      id="help-dd"
      componentClass={
            ({ children, ...props }) => (
              <li
                {...props}
                className="dropdown"
              >
                {children}
              </li>
            )
        }
    >
      <Dropdown.Toggle
        noCaret
        componentClass={
                ({ children, ...props }) => (
                  <a
                    {...props}
                    className="dropdown-toggle nav-item-iconic"
                    data-toggle="dropdown"
                    id="help-menu"
                  >
                    {children}
                  </a>
                )
            }
      >
        <Icon type="pf" name="help" title={__('Help')} />
      </Dropdown.Toggle>
      <Dropdown.Menu aria-labelledby="help-menu">
        {section.items.map(item => (
          item.visible && (
          <MenuItem
            id={`help-menu-${item.name.toLowerCase()}`}
            key={item.id}
            href={item.link_params.href}
            onClick={e => (item.type === 'modal' ? sendDataWithRx({ type: 'showAboutModal' }) : !miqCheckForChanges() && e.preventDefault())}
          >
            {item.name}
          </MenuItem>
          )
        ))}
      </Dropdown.Menu>
    </Dropdown>
    )))
);

Help.propTypes = {
  helpMenu: PropTypes.arrayOf(PropTypes.shape({
    ...helpMenuProps,
    items: PropTypes.arrayOf(PropTypes.shape(recursiveHelpMenuProps)),
  })).isRequired,
};

export default Help;
