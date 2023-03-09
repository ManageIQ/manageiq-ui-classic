import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'carbon-components-react';
import { SideNavItems, SideNavItem } from 'carbon-components-react/es/components/UIShell';
import { Collaborate20 } from '@carbon/icons-react';
import TooltipIcon from 'carbon-components-react/es/components/TooltipIcon';

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
      <TooltipIcon
        direction="right"
        tooltipText={sprintf(__('Current group: %s'), currentOption.label)}
      >
        <Collaborate20 />
      </TooltipIcon>
    </SideNavItem>
  );

  const singleGroup = (
    <SideNavItem className="padded collapse_icon">
      {currentOption.label}
    </SideNavItem>
  );

  const multiGroup_old = (
    <Dropdown
      ariaLabel={__('Change current group')}
      id="miq-nav-group-switch-dropdown"
      initialSelectedItem={currentOption}
      items={options}
      label={__('Change current group')}
      onChange={groupChange}
    />
  );
  
  const multiGroup = (
    <Dropdown
      hideLabel
      id="miq-nav-group-switch-dropdown"
      label={__('Change current group')}
      items={options}
      selectedItem={currentOption}
      onChange={groupChange}
    />
  );

  const expanded = options.length > 1 ? multiGroup : singleGroup;

  return (
    <div className="menu-group">
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
