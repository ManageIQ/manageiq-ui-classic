import React from 'react';
import { SideNavItem } from 'carbon-components-react/es/components/UIShell';
import { UserAvatar20 } from '@carbon/icons-react';

export const Username = ({ applianceName, currentUser, expanded }) => {
  const title = `${currentUser.name} | ${currentUser.userid} | ${applianceName}`;

  return (
    <div
      className="menu-user"
      data-userid={currentUser.userid}
      title={title}
    >
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
