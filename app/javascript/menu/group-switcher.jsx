import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Button, SideNavItems, SideNavItem } from '@carbon/react';
import { Collaborate } from '@carbon/react/icons';

const { miqChangeGroup } = window;

const GroupSwitcher = ({ miqGroups, currentGroup, expanded: isExpanded }) => {
  const options = miqGroups.map(({ id, description }) => ({
    label: description,
    value: id,
  }));

  const currentOption = {
    label: currentGroup.description,
    value: currentGroup.id,
  };

  const groupChange = ({ selectedItem: { value } }) => {
    if (value && value !== currentGroup.id) {
      miqChangeGroup(value);
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
    <div className={`menu-group${!isExpanded ? ' miq-menu-group-switcher-collapsed' : ''}`}>
      <SideNavItems>
        { isExpanded ? expanded : collapsed }
      </SideNavItems>
    </div>
  );
};

GroupSwitcher.propTypes = {
  miqGroups: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  })),
  currentGroup: PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }),
  expanded: PropTypes.bool,
};

GroupSwitcher.defaultProps = {
  miqGroups: [],
  currentGroup: {},
  expanded: false,
};

export default GroupSwitcher;
