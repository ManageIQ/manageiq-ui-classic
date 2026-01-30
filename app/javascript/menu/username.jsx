import React from 'react';
import PropTypes from 'prop-types';
import { SideNavItems, SideNavItem, Button } from '@carbon/react';
import { UserAvatar } from '@carbon/react/icons';

const Username = ({ applianceName, currentUser, expanded }) => {
  const title = `${currentUser.name} | ${currentUser.userid} | ${applianceName}`;

  return (
    <div className={`menu-user${!expanded ? ' miq-menu-user-collapsed' : ''}`} data-userid={currentUser.userid} title={title}>
      {expanded && (
        <SideNavItems>
          <SideNavItem className="padded collapse_icon">
            <span>
              {currentUser.name}
            </span>
          </SideNavItem>
        </SideNavItems>
      )}
      {expanded || (
        <SideNavItems>
          <SideNavItem className="padded collapse_icon">
            <Button
              kind="ghost"
              size="sm"
              hasIconOnly
              iconDescription={sprintf(
                __('User: %s'),
                currentUser.name
              )}
              renderIcon={(props) => <UserAvatar size={20} {...props} />}
              tooltipAlignment="center"
              tooltipPosition="right"
            />
          </SideNavItem>
        </SideNavItems>
      )}
    </div>
  );
};

Username.propTypes = {
  applianceName: PropTypes.string.isRequired,
  currentUser: PropTypes.shape({
    name: PropTypes.string,
    userid: PropTypes.string,
  }).isRequired,
  expanded: PropTypes.bool,
};

Username.defaultProps = {
  expanded: false,
};

export default Username;
