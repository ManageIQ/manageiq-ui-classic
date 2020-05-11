import React from 'react';
import { SideNavItem } from 'carbon-components-react/es/components/UIShell';

export const Username = ({ applianceName, currentUser, expanded }) => {
  const title = `${currentUser.name} | ${currentUser.userid} | ${applianceName}`;
  const initials = Array.from(currentUser.name).filter((x) => x.match(/\p{Upper}/u)).join('').substr(0, 3) || currentUser.name[0];

  return (
    <SideNavItem className="padded">
      <p
        data-userid={currentUser.userid}
        id="username_display"
        title={title}
      >
        { expanded ? currentUser.name : initials }
      </p>
    </SideNavItem>
  );
};
