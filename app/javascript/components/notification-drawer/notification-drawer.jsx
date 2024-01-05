import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft16, Close16 } from '@carbon/icons-react';
import {
  Button, Accordion, AccordionItem, InlineNotification, OverflowMenu, OverflowMenuItem,
} from 'carbon-components-react';
import { getNotficationStatusIconName, newCountText, viewDetails } from './helpers';
import { maxNotifications as maxNotificationsConstant } from '../../notifications/backend';
import {
  toggleDrawerVisibility, markNotificationRead, markAllRead, clearNotification, clearAll, toggleMaxNotifications,
} from '../../miq-redux/actions/notifications-actions';

import initNotifications from '../../notifications/init';

const NotificationDrawer = ({ jsRequest }) => {
  const dispatch = useDispatch();
  const drawerTitle = __('Notifications');
  const [isDrawerExpanded, setDrawerExpanded] = useState(false);
  const {
    isDrawerVisible, unreadCount, notifications, totalNotificationsCount, maxNotifications,
  } = useSelector(({ notificationReducer }) => notificationReducer);
  useEffect(() => {
    if (!jsRequest) {
      initNotifications();
    }
  }, []);
  return (
    isDrawerVisible ? (
      <div id="miq-notifications-drawer-container">
        <div className={`notification-drawer ${isDrawerExpanded ? 'notification-drawer-expanded' : ''}`}>
          <div className="panel-header">
            <Button
              hasIconOnly
              renderIcon={ChevronLeft16}
              className={!isDrawerExpanded ? 'collapsed heading-icon' : 'expanded  heading-icon'}
              iconDescription={!isDrawerExpanded ? 'collapsed' : 'expanded'}
              onClick={() => setDrawerExpanded(!isDrawerExpanded)}
              onKeyPress={() => setDrawerExpanded(!isDrawerExpanded)}
            />
            <Button
              hasIconOnly
              renderIcon={Close16}
              className="heading-icon closeIcon"
              description={__('Close')}
              iconDescription={__('Close')}
              onClick={() => dispatch(toggleDrawerVisibility())}
              onKeyPress={() => dispatch(toggleDrawerVisibility())}
            />
            <h3 className="notification-title">{drawerTitle}</h3>
          </div>
          <div className="notification-content">
            <div>
              {' '}
              <Accordion align="start" className="Notification-accordion">
                <AccordionItem
                  title={(
                    <div className="events-count">
                      <span>{__('Events') }</span>
                      <span>{newCountText(unreadCount)}</span>
                    </div>
                  )}
                >
                  <div className="notification-accordion-content">
                    <div className="notification-content-messages">
                      {notifications.slice(0, maxNotifications).map((notification) => (
                        <InlineNotification
                          kind={getNotficationStatusIconName(notification)}
                          role="alert"
                          key={notification.id}
                          className={!notification.unread ? 'read' : 'unread'}
                          title={notification.message}
                          statusIconDescription={getNotficationStatusIconName(notification)}
                          lowContrast
                          hideCloseButton
                          subtitle={(
                            <div className="subtitle-div">
                              <div className="subtitle-div-notification-menu">
                                <OverflowMenu
                                  ariaLabel={__('open and close options')}
                                  id={notification.id}
                                  floatingmenu="true"
                                  flipped
                                  title={__('open and close options')}
                                >

                                  <OverflowMenuItem
                                    className={`overflow-options details-${notification.id}`}
                                    aria-label={__('View details')}
                                    itemText={__('View details')}
                                    disabled={!notification.data.link}
                                    onKeyDown={() => viewDetails(notification)}
                                    requireTitle
                                    onClick={() => viewDetails(notification)}
                                  />
                                  <OverflowMenuItem
                                    className={`overflow-options markasread-${notification.id}`}
                                    aria-label={__('Mark as read')}
                                    itemText={__('Mark as read')}
                                    disabled={!notification.unread}
                                    onKeyDown={
                                      () => notification.unread && dispatch(markNotificationRead(notification))
                                    }
                                    requireTitle
                                    onClick={
                                      () => notification.unread && dispatch(markNotificationRead(notification))
                                    }
                                    hasDivider
                                  />
                                  <OverflowMenuItem
                                    className={`overflow-options remove-${notification.id}`}
                                    aria-label={__('Remove')}
                                    itemText={__('Remove')}
                                    onKeyDown={
                                      () => dispatch(clearNotification(notification, !!maxNotifications))
                                    }
                                    requireTitle
                                    onClick={
                                      () => dispatch(clearNotification(notification, !!maxNotifications))
                                    }
                                    isDelete
                                  />
                                </OverflowMenu>
                              </div>
                              <div className="subtitle-div-notification-time">
                                <span className="notification-time">
                                  {moment(notification.timeStamp).format('MM/DD/YYYY')}
                                  {' '}
                                  {'|'}
                                  {' '}
                                  {moment(notification.timeStamp).format('h:mm:ss A')}
                                </span>
                              </div>

                            </div>
                          )}

                        />

                      ))}
                      { maxNotificationsConstant < totalNotificationsCount && (
                        <div className="maxnotifications-text">
                          <span>
                            { maxNotifications ? sprintf(__('Showing %s items out of %s total.'), maxNotifications, totalNotificationsCount)
                              : sprintf(__('Showing all %s items.'), notifications.length) }
                          </span>
                          <Button
                            id="toggleMaxNotifications"
                            kind="ghost"
                            onClick={() =>
                              dispatch(toggleMaxNotifications())}
                          >
                            { maxNotifications ? __('Show all (may take a while)') : sprintf(__('Show only the first %s'), maxNotificationsConstant)}
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="notification-footer">
                      <Button
                        id="markAllReadBtn"
                        disabled={unreadCount === 0}
                        kind="ghost"
                        onClick={
                          () => {
                            dispatch(markAllRead(notifications));
                          }
                        }
                      >
                        {__('Mark All Read')}
                      </Button>
                      <Button
                        id="clearAllBtn"
                        kind="ghost"
                        disabled={notifications.length === 0}
                        onClick={
                          () => dispatch(clearAll(notifications, !!maxNotifications))
                        }
                      >
                        {__('Clear All')}
                      </Button>
                    </div>
                  </div>

                </AccordionItem>
              </Accordion>
            </div>

          </div>
        </div>
      </div>
    )
      : null
  );
};

export default NotificationDrawer;

NotificationDrawer.propTypes = {
  jsRequest: PropTypes.bool,
};

NotificationDrawer.defaultProps = {
  jsRequest: false,
};
