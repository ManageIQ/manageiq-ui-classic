import React from 'react';
import { SideNavItem } from 'carbon-components-react/es/components/UIShell';

export const Username = ({ applianceName, currentUser, expanded }) => {
  const title = `${currentUser.name} | ${currentUser.userid} | ${applianceName}`;
  const initials = Array.from(currentUser.name).filter((x) => x.match(/\p{Upper}/u)).join('').substr(0, 3) || currentUser.name[0];

  return (
    <SideNavItem className="padded menu-user vertical-center">
      <span
        className={expanded ? 'expanded' : 'collapsed'}
        data-userid={currentUser.userid}
        id="username_display"
        title={title}
      >
        { expanded ? currentUser.name : initials }
      </span>
    </SideNavItem>
  );
};
