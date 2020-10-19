import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'carbon-components-react/es/components/Dropdown';
import SideNavItem from 'carbon-components-react/es/components/UIShell/SideNavItem';
import { Collaborate20 } from '@carbon/icons-react';

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
    <SideNavItem className="padded vertical-center">
      <Collaborate20 />
    </SideNavItem>
  );

  const singleGroup = (
    <SideNavItem className="padded vertical-center">
      {currentOption.label}
    </SideNavItem>
  );

  const multiGroup = (
    <Dropdown
      ariaLabel={__('Change current group')}
      id="miq-nav-group-switch-dropdown"
      initialSelectedItem={currentOption}
      items={options}
      label={__('Change current group')}
      onChange={groupChange}
    />
  );

  const expanded = options.length > 1 ? multiGroup : singleGroup;

  return (
    <div
      className="menu-group"
      title={`${__('Current group:')} ${currentOption.label}`}
    >
      { isExpanded ? expanded : collapsed }
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
