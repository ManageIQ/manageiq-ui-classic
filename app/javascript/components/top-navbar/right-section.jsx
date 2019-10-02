import React from 'react';
import PropTypes from 'prop-types';
import CustomLogo from './custom-logo';
import Notifications from './notifications';
import Help from './help';
import Configuration from './configuration';
import UserOptions from './user-options';
import {
  groupProps, helpMenuProps, recursiveHelpMenuProps, userMenuProps, recursiveUserMenuProps,
} from './recursive-props';

const RightSection = ({
  customLogo, currentUser, helpMenu, opsExplorerAllowed, applianceName, miqGroups, currentGroup, userMenu,
}) => (
  <React.Fragment>
    <CustomLogo customLogo={customLogo} />
    <Notifications />
    <Help helpMenu={helpMenu} />
    { currentUser && (
      <React.Fragment>
        <Configuration opsExplorerAllowed={opsExplorerAllowed} />
        <UserOptions currentUser={currentUser} applianceName={applianceName} miqGroups={miqGroups} currentGroup={currentGroup} userMenu={userMenu} />
      </React.Fragment>
    )}
  </React.Fragment>
);

RightSection.defaultProps = {
  currentUser: null,
};

RightSection.propTypes = {
  customLogo: PropTypes.bool.isRequired,
  currentUser: PropTypes.shape({
    name: PropTypes.string.isRequired,
    userid: PropTypes.string.isRequired,
  }),
  opsExplorerAllowed: PropTypes.bool.isRequired,
  applianceName: PropTypes.string.isRequired,
  miqGroups: PropTypes.arrayOf(
    PropTypes.shape({
      ...groupProps,
    }).isRequired,
  ).isRequired,
  currentGroup: PropTypes.shape({
    ...groupProps,
  }).isRequired,
  helpMenu: PropTypes.arrayOf(PropTypes.shape({
    ...helpMenuProps,
    items: PropTypes.arrayOf(PropTypes.shape(recursiveHelpMenuProps)),
  })).isRequired,
  userMenu: PropTypes.arrayOf(PropTypes.shape({
    ...userMenuProps,
    items: PropTypes.arrayOf(PropTypes.shape(recursiveUserMenuProps)),
  })).isRequired,
};

export default RightSection;
