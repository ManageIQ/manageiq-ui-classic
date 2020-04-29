import React from 'react';
import PropTypes from 'prop-types';
import CustomLogo from './custom-logo';
import Notifications from './notifications';
import UserOptions from './user-options';

const RightSection = ({
  customLogo, currentUser, applianceName, miqGroups, currentGroup
}) => (
  <ul className="nav navbar-nav navbar-right navbar-iconic">
    <CustomLogo customLogo={customLogo} />
    <Notifications />
    { currentUser && (
      <React.Fragment>
        <UserOptions currentUser={currentUser} applianceName={applianceName} miqGroups={miqGroups} currentGroup={currentGroup} />
      </React.Fragment>
    )}
  </ul>
);

RightSection.propTypes = {
  customLogo: PropTypes.bool.isRequired,
  currentUser: PropTypes.shape({
    name: PropTypes.string.isRequired,
    userid: PropTypes.string.isRequired,
  }).isRequired,
  applianceName: PropTypes.string.isRequired,
  miqGroups: PropTypes.any,
  currentGroup: PropTypes.any,
};

export default RightSection;
