import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, NotificationDrawer as Drawer, Notification, MenuItem, NotificationContent, NotificationInfo, NotificationMessage, Icon,
} from 'patternfly-react';
import classnames from 'classnames';
import { unreadCountText } from './helpers';

const NotificationDrawer = () => {
  const dispatch = useDispatch();
  const isDrawerVisible = useSelector(({ notificationReducer: { isDrawerVisible } }) => isDrawerVisible);
  const drawerTitle = __('Notifications');
  const [isDrawerExpanded, setDrawerExpanded] = useState(false);
  const [isPanelExpanded, setPanelExpanded] = useState(true);
  const unreadCount = useSelector(({ notificationReducer: { unreadCount } }) => unreadCount);
  const notifications = useSelector(({ notificationReducer: { notifications } }) => notifications);

  console.log(notifications);

  return (
    isDrawerVisible ? (
      <div id="miq-notifications-drawer-container">
        <Drawer expanded={isDrawerExpanded}>
          <Drawer.Title
            title={drawerTitle}
            onCloseClick={() => { dispatch({ type: '@@notifications/toggleDrawerVisibility', payload: isDrawerVisible }); }}
            onExpandClick={() => { setDrawerExpanded(!isDrawerExpanded); }}
          />
          {notifications && (
            <Drawer.Accordion>
              <Drawer.Panel expanded={isPanelExpanded}>
                <Drawer.PanelHeading>
                  <Drawer.PanelTitle>
                    <a
                      className={isPanelExpanded ? '' : 'collapsed'}
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
                      {notifications.map(notification => (
                        <Notification key={notification.id} seen={!notification.unread} type="notification">
                          <Drawer.Dropdown
                            id={`dropdownKebabRight ${notification.id}`}
                            pullRight
                          >
                            <MenuItem
                              bsClass="dropdown"
                              disabled={!notification.data.link}
                              eventKey="1"
                              header={false}
                            >
                              {__('View details')}
                            </MenuItem>
                            <MenuItem divider />
                            <MenuItem
                              bsClass={classnames('dropdown', {
                                disabled: !notification.unread,
                              })}
                              disabled={!notification.unread}
                              eventKey="2"
                              header={false}
                              onClick={
                                () => notification.unread && dispatch({
                                  type: '@@notifications/markNotificationRead',
                                  payload: notification.id,
                                })
                              }
                            >
                              {__('Mark as read')}
                            </MenuItem>
                            <MenuItem
                              bsClass="dropdown"
                              eventKey="3"
                              header={false}
                              onClick={() => dispatch({
                                type: '@@notifications/clearNotification',
                                payload: notification,
                              })}
                            >
                              {__('Remove')}
                            </MenuItem>
                          </Drawer.Dropdown>
                          <Icon
                            className="pull-left"
                            name="ok"
                            type="pf"
                          />
                          <NotificationContent className="">
                            <NotificationMessage
                              title={notification.message}
                              onClick={
                                () => notification.unread && dispatch({
                                  type: '@@notifications/markNotificationRead',
                                  payload: notification.id,
                                })}
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
                    </Drawer.PanelBody>
                    <Drawer.PanelAction>
                      <Drawer.PanelActionLink
                        className="footer-button-left"
                        data-toggle="mark-all-read"
                      >
                        <Button
                          active={false}
                          block={false}
                          bsClass="btn"
                          bsStyle="link"
                          disabled={unreadCount === 0}
                          onClick={() => dispatch({ type: '@@notifications/markAllRead' })}
                        >
                          {__('Mark All Read')}
                        </Button>
                      </Drawer.PanelActionLink>
                      <Drawer.PanelActionLink
                        className="footer-button-right"
                        data-toggle="clear-all"
                      >
                        <Button
                          active={false}
                          block={false}
                          bsClass="btn"
                          bsStyle="link"
                          disabled={notifications.length === 0}
                          onClick={() => dispatch({ type: '@@notifications/clearAll' })}
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
