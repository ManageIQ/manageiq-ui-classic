/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';

const SelectedGroupsList = ({ groups }) => {
  const selectedGroups = [];

  if (groups) {
    groups.sort();
    groups.forEach((group) => {
      selectedGroups.push(
        <div key={group}>
          <i className="ff ff-group" />
          <p className="group-name" id={group}>
            {group}
          </p>
          <br />
        </div>
      );
    });
  }

  return (
    <div>
      <label id="selected-groups-label">
        {__('Selected Groups')}
      </label>
      <div id="selected-groups">
        {selectedGroups}
      </div>
    </div>
  );
};

SelectedGroupsList.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.string),
};

SelectedGroupsList.defaultProps = {
  groups: [],
};

export default SelectedGroupsList;
