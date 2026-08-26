import React from 'react';
import {
  Dropdown,
  Button,
  SideNavItems,
  SideNavItem,
} from '@carbon/react';
import { Collaborate } from '@carbon/react/icons';
import type { OptionType } from '../types/forms';

type MiqGroupType = {
  id: string;
  description: string;
};

type GroupSwitcherProps = {
  miqGroups?: MiqGroupType[];
  currentGroup: MiqGroupType;
  expanded?: boolean;
};

const GroupSwitcher: React.FC<GroupSwitcherProps> = ({
  miqGroups = [],
  currentGroup,
  expanded: isExpanded = false,
}) => {
  const options = miqGroups.map(({ id, description }) => ({
    label: description,
    value: id,
  }));

  const currentOption = {
    label: currentGroup.description,
    value: currentGroup.id,
  };

  const groupChange = ({ selectedItem }: { selectedItem: OptionType }) => {
    if (selectedItem?.value && selectedItem.value !== currentGroup.id) {
      miqChangeGroup(selectedItem.value as string);
    }
  };

  const collapsed = (
    <SideNavItem className="padded collapse_icon">
      <Button
        kind="ghost"
        size="sm"
        hasIconOnly
        iconDescription={sprintf(__('Current group: %s'), currentOption.label)}
        renderIcon={(props) => <Collaborate size={20} {...props} />}
        tooltipAlignment="center"
        tooltipPosition="right"
      />
    </SideNavItem>
  );

  const singleGroup = (
    <SideNavItem className="padded collapse_icon">
      {currentOption.label}
    </SideNavItem>
  );

  const multiGroup = (
    <Dropdown
      hideLabel
      id="miq-nav-group-switch-dropdown"
      label={__('Change current group')}
      items={options}
      selectedItem={currentOption}
      onChange={groupChange}
      titleText={currentOption.label}
    />
  );

  const expanded = options.length > 1 ? multiGroup : singleGroup;

  return (
    <div
      className={`menu-group${!isExpanded ? ' miq-menu-group-switcher-collapsed' : ''}`}
    >
      <SideNavItems>{isExpanded ? expanded : collapsed}</SideNavItems>
    </div>
  );
};

export default GroupSwitcher;
