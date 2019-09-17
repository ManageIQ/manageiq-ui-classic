import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';
import { connect } from 'react-redux';

const Notifications = ({
  unreadCount,
}) => (
  <li className="dropdown">
    <a
      id="notifications-btn"
      className="nav-item-iconic drawer-pf-trigger-icon"
      title={`${unreadCount} ${__('unread notifications')}`}
      onClick={(event) => {
        sendDataWithRx({ type: 'toggleNotificationsList' });
        event.preventDefault();
      }}
    >
      <Icon type="fa" name="bell" />
      <span className="badge badge-pf-bordered">{unreadCount > 0 ? ' ' : ''}</span>
    </a>
  </li>
);

const mapStateToProps = ({ notificationReducer: { unreadCount } }) => ({ unreadCount });

Notifications.propTypes = {
  unreadCount: PropTypes.number.isRequired,
};

export default connect(mapStateToProps)(Notifications);
