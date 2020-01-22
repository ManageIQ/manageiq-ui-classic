import React, { useState } from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, NotificationDrawer as Drawer, Notification, MenuItem, NotificationContent, NotificationInfo, NotificationMessage, Icon,
} from 'patternfly-react';
import classnames from 'classnames';
import { getNotficationStatusIconName, unreadCountText, viewDetails } from './helpers';
import { maxNotifications as maxNotificationsConstant, notificationsInit } from '../../packs/notification-drawer-common';

const NotificationDrawer = () => {
  const dispatch = useDispatch();
  const isDrawerVisible = useSelector(({ notificationReducer: { isDrawerVisible } }) => isDrawerVisible);
  const drawerTitle = __('Notifications');
  const [isDrawerExpanded, setDrawerExpanded] = useState(false);
  const [isPanelExpanded, setPanelExpanded] = useState(true);
  const unreadCount = useSelector(({ notificationReducer: { unreadCount } }) => unreadCount);
  const notifications = useSelector(({ notificationReducer: { notifications } }) => notifications);
  const totalNotificationsCount = useSelector(({ notificationReducer: { totalNotificationsCount } }) => totalNotificationsCount);
  const maxNotifications = useSelector(({ notificationReducer: { maxNotifications } }) => maxNotifications);

  return (
    isDrawerVisible ? (
      <div id="miq-notifications-drawer-container">
        <Drawer expanded={isDrawerExpanded}>
          <Drawer.Title
            title={drawerTitle}
            onCloseClick={() => { dispatch({ type: '@@notifications/toggleDrawerVisibility' }); }}
            onExpandClick={() => { setDrawerExpanded(!isDrawerExpanded); }}
          />
          {notifications && (
            <Drawer.Accordion>
              <Drawer.Panel expanded={isPanelExpanded}>
                <Drawer.PanelHeading>
                  <Drawer.PanelTitle>
                    <a
                      id="eventsExpander"
                      className={classnames({ collapsed: !isPanelExpanded })}
                      onClick={() => { setPanelExpanded(!isPanelExpanded); }}
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
                                () => notification.unread
                                && API.post(`/api/notifications/${notification.id}`, { action: 'mark_as_seen' })
                                  .then(() =>
                                    dispatch({
                                      type: '@@notifications/markNotificationRead',
                                      payload: notification.id,
                                    }))
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
                                () => API.delete(`/api/notifications/${notification.id}`)
                                  .then(() => {
                                    dispatch({
                                      type: '@@notifications/clearNotification',
                                      payload: notification,
                                    });
                                    notificationsInit(maxNotifications !== undefined);
                                  })
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
                              () => notification.unread && dispatch({
                                type: '@@notifications/markNotificationRead',
                                payload: notification.id,
                              })}
                          />
                          <NotificationContent>
                            <NotificationMessage
                              title={notification.message}
                              onClick={
                                () => notification.unread
                                && API.post(`/api/notifications/${notification.id}`, { action: 'mark_as_seen' })
                                  .then(() =>
                                    dispatch({
                                      type: '@@notifications/markNotificationRead',
                                      payload: notification.id,
                                    }))
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
                              { maxNotifications ? __(`Showing ${maxNotifications} items out of ${totalNotificationsCount} total.`) : __(`Showing all ${notifications.length} items.`) }
                            </NotificationMessage>
                            <a
                              id="toggleMaxNotifications"
                              className="btn btn-link"
                              onClick={() => {
                                notificationsInit(!maxNotifications);
                                dispatch({ type: '@@notifications/toggleMaxNotifications' });
                              }
                              }
                            >
                              { maxNotifications ? __('Show all (may take a while)') : __(`Show only the first ${maxNotificationsConstant}`)}
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
                              const resources = notifications.map(notification => ({ id: notification.id }));
                              API.post('/api/notifications/', { action: 'mark_as_seen', resources })
                                .then(() =>
                                  dispatch({ type: '@@notifications/markAllRead' }));
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
                            () => {
                              const resources = notifications.map(notification => ({ id: notification.id }));
                              API.post('/api/notifications/', { action: 'delete', resources })
                                .then(() => notificationsInit(Boolean(maxNotifications)));
                            }
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
