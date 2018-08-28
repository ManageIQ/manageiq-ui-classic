import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Spinner } from 'patternfly-react';
import { goBack } from 'connected-react-router';
import { Redirect } from 'react-router-dom';
import { RbacUserForm } from '@manageiq/react-ui-components/dist/rbac-forms';
import { loadGroups, saveUser, editUser } from '../redux/actions';

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
  render() {
    const { groups, goBack, saveUser, isEditing, editUser, user } = this.props;
    if (isEditing && !user) return <Redirect to="/add" />
    if (!groups) return <div><Spinner loading size="lg" /></div>;
    return (
      <div>
        <h1>User add</h1>
        <RbacUserForm
          groups={groups}
          newRecord={!isEditing}
          initialValues={user ? {...user, groups: user.groups.map(({ groupId }) => groupId)} : undefined}
          onCancel={goBack}
          onSave={values => isEditing ? editUser(parseUserValues(values), user.id) : saveUser(parseUserValues(values))}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ usersReducer: { groups, rows } }, { match : { url, params: { userId } } }) => {
  const isEditing = url.match(/^\/edit\/[0-9]+$/) && userId;
  const user = isEditing ? rows.find(({ id }) => id === userId) : undefined;
  return {
    groups,
    isEditing,
    user,
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  loadGroups,
  goBack,
  saveUser,
  editUser,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(UserAdd);