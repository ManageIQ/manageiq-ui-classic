import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Spinner } from 'patternfly-react';
import { goBack } from 'connected-react-router';
import { Redirect } from 'react-router-dom';
import { RbacUserForm } from '@manageiq/react-ui-components/dist/rbac-forms';
import { loadGroups, saveUser, editUser, createFlashMessage } from '../redux/actions';
import { API } from '../../../http_api';

const parseUserValues = ({
  name,
  userid,
  groups,
  password,
  email,
}) => ({
  name,
  userid,
  miq_groups: groups.map(id => ({ id })),
  password,
  email,
});

class UserAdd extends Component {  
  componentDidMount() {
    if (!this.props.groups) {
      this.props.loadGroups();
    }
  }
  handleCancelClicked = () => {
    const { goBack, createFlashMessage } = this.props;
    createFlashMessage(__('User Edit was cancelled by the user'), 'info');
    goBack();
  };

  render() {
    const { groups, saveUser, isEditing, editUser, user, copy } = this.props;
    if (isEditing && !user) return <Redirect to="/add" />;
    if (copy && !user) return <Redirect to="/add" />;
    if (!groups) return <div><Spinner loading size="lg" /></div>;
    const initialValues = copy ? { ...user, userid: undefined } : user;
    return (
      <div>
        <h1>User add</h1>
        <RbacUserForm
          groups={groups}
          newRecord={!isEditing}
          initialValues={initialValues ? {...initialValues, groups: user.groups.map(({ groupId }) => groupId)} : undefined}
          onCancel={this.handleCancelClicked}
          onSave={values => isEditing ? editUser(parseUserValues(values), user.id) : saveUser(parseUserValues(values))}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ usersReducer: { groups, rows, selectedUsers } }, { match : { url, params: { userId, copy } } }) => {
  const isEditing = url.match(/^\/edit\/[0-9]+$/) && userId;
  const user = isEditing ? rows.find(({ id }) => id === userId) : copy && selectedUsers ? selectedUsers[0]  : undefined;
  return {
    groups,
    isEditing,
    user,
    copy,
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  loadGroups,
  goBack,
  saveUser,
  editUser,
  createFlashMessage,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(UserAdd);