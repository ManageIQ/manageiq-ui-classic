import Dropdown from 'carbon-components-react/es/components/Dropdown';
import React from 'react';
import SideNavItem from 'carbon-components-react/es/components/UIShell/SideNavItem';
import { Collaborate20 } from '@carbon/icons-react';

const { miqChangeGroup } = window;

export const GroupSwitcher = ({ miqGroups, currentGroup, expanded }) => {
  const options = miqGroups.map((g) => ({
    label: g.description,
    value: g.id,
  }));

  const currentOption = {
    label: currentGroup.description,
    value: currentGroup.id,
  };

  const groupChange = ({ selectedItem }) => {
    const group_id = selectedItem.value;
    if (group_id && group_id !== currentGroup.id) {
      miqChangeGroup(group_id);
    }
  };

  return (
    <div
      className="menu-group"
      title={`${__("Current group:")} ${currentOption.label}`}
    >
      { expanded ? (
        <>
          { options.length > 1 ? (
            <Dropdown
              ariaLabel={__("Change current group")}
              id='miq-nav-group-switch-dropdown'
              initialSelectedItem={currentOption}
              items={options}
              label={__("Change current group")}
              onChange={groupChange}
            />
          ) : (
            <SideNavItem className="padded vertical-center">
              {currentOption.label}
            </SideNavItem>
          )}
        </>
      ) : (
        <SideNavItem className="padded vertical-center">
          <Collaborate20 />
        </SideNavItem>
      )}
    </div>
  );
};
