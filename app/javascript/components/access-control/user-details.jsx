import React from 'react';
import PropTypes from 'prop-types';
import { RbacUserTagsList } from '@manageiq/react-ui-components/dist/rbac-forms';
import RbacUserPreview from './rbac-user-preview';

const UserDetails = ({
  user,
  permission,
  customEvents,
  tags,
  tenant,
  onEventClick,
}) => (
  <div>
    <RbacUserPreview user={user} onEventClick={() => onEventClick('events')} permission={permission} customEvents={customEvents} />
    <hr />
    <RbacUserTagsList tags={tags} tenant={tenant} />
  </div>
);

UserDetails.propTypes = {
  user: PropTypes.object.isRequired,
  permission: PropTypes.bool.isRequired,
  customEvents: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  tenant: PropTypes.string.isRequired,
  onEventClick: PropTypes.func.isRequired,
};

export default UserDetails;
