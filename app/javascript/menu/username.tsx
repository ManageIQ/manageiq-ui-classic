import React from 'react';
import { SideNavItems, SideNavItem, Button } from '@carbon/react';
import { UserAvatar } from '@carbon/react/icons';
import type { CurrentUserType } from './menu-common-types';

type UsernameProps = {
  applianceName: string;
  currentUser: CurrentUserType;
  expanded?: boolean;
};

const Username: React.FC<UsernameProps> = ({
  applianceName,
  currentUser,
  expanded = false,
}) => {
  const title = `${currentUser.name} | ${currentUser.userid} | ${applianceName}`;

  return (
    <div
      className={`menu-user${!expanded ? ' miq-menu-user-collapsed' : ''}`}
      data-userid={currentUser.userid}
      title={title}
    >
      {expanded && (
        <SideNavItems>
          <SideNavItem className="padded collapse_icon">
            <span>{currentUser.name}</span>
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
              iconDescription={sprintf(__('User: %s'), currentUser.name)}
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

export default Username;
