import React from 'react';
import PropTypes from 'prop-types';
import { SideNavItems, SideNavItem } from 'carbon-components-react/es/components/UIShell';
import { UserAvatar20 } from '@carbon/icons-react';

const Username = ({ applianceName, currentUser, expanded }) => {
  const title = `${currentUser.name} | ${currentUser.userid} | ${applianceName}`;

  return (
    <div className="menu-user" data-userid={currentUser.userid} title={title}>
      { expanded && (
        <SideNavItems>
          <SideNavItem className="padded collapse_icon">
            <span>
              {currentUser.name}
            </span>
          </SideNavItem>
        </SideNavItems>
      )}
      { expanded || (
        <SideNavItems>
          <SideNavItem className="padded collapse_icon">
            <UserAvatar20 />
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
