import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { API, http } from '../../http_api';
import UserDetails from './user-details';
import CustomEvents from './custom-events';
import { cleanVirtualDom } from '../../miq-component/helpers';

// eslint-disable-next-line max-len
const getUserCustomButtons = userId => `/api/users/${userId}/custom_button_events?expand=resources&attributes=message,created_on,username,automate_entry_point,button_name`;

// eslint-disable-next-line max-len
const requestUser = userId => `/api/users/${userId}/?expand=resources&attributes=current_group,miq_groups,current_group.miq_user_role,tags&sort_by=name`;

class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      view: 'user-info',
    };
  }

  componentDidMount() {
    const { userId } = this.props;
    cleanVirtualDom();
    miqSparkleOn();
    Promise.all([
      API.get(getUserCustomButtons(userId))
        .then(({ resources }) => this.setState({ customEvents: resources })),
      API.get(requestUser(userId))
        .then(item => this.setState({
          user: {
            ...item,
            current_group: {
              label: item.current_group.description,
              id: item.current_group.id,
              onClick: () => miqOnClickSelectRbacTreeNode(`g-${item.current_group.id}`),
            },
            role: {
              label: item.current_group.miq_user_role.name,
              id: item.current_group.miq_user_role.id,
              onClick: () => miqOnClickSelectRbacTreeNode(`ur-${item.current_group.miq_user_role.id}`),
            },
            miq_groups: item.miq_groups.map(group => group.id),
            groups: item.miq_groups.map(group => ({
              label: group.description,
              icon: 'group',
              groupId: group.id,
              value: group.id,
              onClick: () => miqOnClickSelectRbacTreeNode(`g-${group.id}`),
            })),
          },
        })),
      http.get('/api?attributes=identity')
        .then(data => this.setState({
          permission: data.identity.miq_groups.find(group => data.identity.group === group.description).product_features.includes('everything'),
        })),
      http.get(`/ops/user_tags?user_id=${userId}`).then(data => this.setState({ ...data })),
    ]).then(() => this.setState({ isFetching: false }, miqSparkleOff));
  }

  onEventClick = view => this.setState({ view })

  render() {
    const {
      permission,
      customEvents,
      isFetching,
      user,
      tags,
      tenant,
      view,
    } = this.state;
    if (isFetching) return null;

    const component = {
      'user-info': () => (
        <UserDetails
          onEventClick={this.onEventClick}
          permission={permission}
          customEvents={customEvents}
          user={user}
          tags={tags}
          tenant={tenant}
        />
      ),
      events: () => <CustomEvents onEventClick={this.onEventClick} events={customEvents} />,
    };
    return component[view]();
  }
}

UserList.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default UserList;
