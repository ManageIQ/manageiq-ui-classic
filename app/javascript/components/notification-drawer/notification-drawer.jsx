import React, { useState } from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, NotificationDrawer as Drawer, Notification, MenuItem, NotificationContent, NotificationInfo, NotificationMessage, Icon,
} from 'patternfly-react';
import classnames from 'classnames';
import { getNotficationStatusIconName, unreadCountText, viewDetails } from './helpers';
import { maxNotifications as maxNotificationsConstant } from '../../packs/notification-drawer-common';
import {
  toggleDrawerVisibility, markNotificationRead, markAllRead, clearNotification, clearAll, toggleMaxNotifications,
} from '../../miq-redux/actions/notifications-actions';

const NotificationDrawer = () => {
  const dispatch = useDispatch();
  const drawerTitle = __('Notifications');
  const [isDrawerExpanded, setDrawerExpanded] = useState(false);
  const [isPanelExpanded, setPanelExpanded] = useState(true);
  const {
    isDrawerVisible, unreadCount, notifications, totalNotificationsCount, maxNotifications,
  } = useSelector(({ notificationReducer }) => notificationReducer);

  return (
    isDrawerVisible ? (
      <div id="miq-notifications-drawer-container">
        <Drawer expanded={isDrawerExpanded}>
          <Drawer.Title
            title={drawerTitle}
            onCloseClick={() => dispatch(toggleDrawerVisibility())}
            onExpandClick={() => setDrawerExpanded(!isDrawerExpanded)}
          />
          {notifications && (
            <Drawer.Accordion>
              <Drawer.Panel expanded={isPanelExpanded}>
                <Drawer.PanelHeading>
                  <Drawer.PanelTitle>
                    <a
                      id="eventsExpander"
                      className={classnames({ collapsed: !isPanelExpanded })}
                      onClick={() => setPanelExpanded(!isPanelExpanded)}
                    >
                      {__('Events')}
                    </a>
                  </Drawer.PanelTitle>
                  <Drawer.PanelCounter text={unreadCountText(unreadCount)} />
                </Drawer.PanelHeading>
                { isPanelExpanded && (
                  <Drawer.PanelCollapse>
                    <Drawer.PanelBody>
                      {notifications.slice(0, maxNotifications).map(notification => (
                        <Notification
                          key={notification.id}
                          seen={!notification.unread}
                          type="notification"
                        >
                          <Drawer.Dropdown
                            id={`dropdownKebabRight ${notification.id}`}
                            pullRight
                          >
                            <MenuItem
                              bsClass="dropdown"
                              disabled={!notification.data.link}
                              eventKey="1"
                              header={false}
                              onClick={() => viewDetails(notification)}
                            >
                              {__('View details')}
                            </MenuItem>
                            <MenuItem divider />
                            <MenuItem
                              id={`dropdownMarkRead-${notification.id}`}
                              bsClass={classnames('dropdown', {
                                disabled: !notification.unread,
                              })}
                              disabled={!notification.unread}
                              eventKey="2"
                              header={false}
                              onClick={
                                () => notification.unread && dispatch(markNotificationRead(notification.id))
                              }
                            >
                              {__('Mark as read')}
                            </MenuItem>
                            <MenuItem
                              id={`dropdownRemove-${notification.id}`}
                              bsClass="dropdown"
                              eventKey="3"
                              header={false}
                              onClick={
                                () => dispatch(clearNotification(notification, Boolean(maxNotifications)))
                              }
                            >
                              {__('Remove')}
                            </MenuItem>
                          </Drawer.Dropdown>
                          <Icon
                            className="pull-left"
                            name={getNotficationStatusIconName(notification)}
                            type="pf"
                            onClick={
                              () => notification.unread && dispatch(markNotificationRead(notification.id))
                            }
                          />
                          <NotificationContent>
                            <NotificationMessage
                              title={notification.message}
                              onClick={
                                () => notification.unread && dispatch(markNotificationRead(notification.id))
                              }
                            >
                              {notification.message}
                            </NotificationMessage>
                            <NotificationInfo
                              leftText={moment(notification.timeStamp).format('MM/DD/YYYY')}
                              rightText={moment(notification.timeStamp).format('h:mm:ss A')}
                            />
                          </NotificationContent>
                        </Notification>
                      ))}
                      { maxNotificationsConstant < totalNotificationsCount && (
                        <Notification id="notificationLimitBar" key="notificationLimit" className="text-center" seen>
                          <NotificationContent>
                            <NotificationMessage
                              title="title"
                            >
                              { maxNotifications ? sprintf(__('Showing %s items out of %s total.'), maxNotifications, totalNotificationsCount) : sprintf(__('Showing all %s items.'), notifications.length) }
                            </NotificationMessage>
                            <a
                              id="toggleMaxNotifications"
                              className="btn btn-link"
                              onClick={() =>
                                dispatch(toggleMaxNotifications())
                              }
                            >
                              { maxNotifications ? __('Show all (may take a while)') : sprintf(__('Show only the first %s'), maxNotificationsConstant)}
                            </a>
                          </NotificationContent>
                        </Notification>)
                      }
                    </Drawer.PanelBody>
                    <Drawer.PanelAction>
                      <Drawer.PanelActionLink
                        className="footer-button-left"
                        data-toggle="mark-all-read"
                      >
                        <Button
                          id="markAllReadBtn"
                          bsStyle="link"
                          disabled={unreadCount === 0}
                          onClick={
                            () => {
                              dispatch(markAllRead(notifications));
                            }
                          }
                        >
                          {__('Mark All Read')}
                        </Button>
                      </Drawer.PanelActionLink>
                      <Drawer.PanelActionLink
                        className="footer-button-right"
                        data-toggle="clear-all"
                      >
                        <Button
                          id="clearAllBtn"
                          bsStyle="link"
                          disabled={notifications.length === 0}
                          onClick={
                            () => dispatch(clearAll(notifications, Boolean(maxNotifications)))
                          }
                        >
                          {__('Clear All')}
                        </Button>
                      </Drawer.PanelActionLink>
                    </Drawer.PanelAction>
                  </Drawer.PanelCollapse>)}
              </Drawer.Panel>
            </Drawer.Accordion>
          )}
        </Drawer>
      </div>
    )
      : null
  );
};

export default NotificationDrawer;
