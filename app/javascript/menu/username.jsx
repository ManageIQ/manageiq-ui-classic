import React from 'react';
import PropTypes from 'prop-types';
import { SideNavItem } from 'carbon-components-react/es/components/UIShell';
import { UserAvatar20 } from '@carbon/icons-react';

const Username = ({ applianceName, currentUser, expanded }) => {
  const title = `${currentUser.name} | ${currentUser.userid} | ${applianceName}`;

  return (
    <div className="menu-user" data-userid={currentUser.userid} title={title}>
      { expanded && (
        <SideNavItem className="padded vertical-center">
          <span>
            {currentUser.name}
          </span>
        </SideNavItem>
      )}
      { expanded || (
        <SideNavItem className="padded vertical-center">
          <UserAvatar20 />
        </SideNavItem>
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
