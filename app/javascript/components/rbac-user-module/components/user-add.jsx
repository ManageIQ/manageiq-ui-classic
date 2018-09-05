import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Spinner } from 'patternfly-react';
import { goBack } from 'connected-react-router';
import { Redirect } from 'react-router-dom';
import { RbacUserForm } from '@manageiq/react-ui-components/dist/rbac-forms';
import PropTypes from 'prop-types';
import { loadGroups, saveUser, editUser, createFlashMessage } from '../redux/actions';

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
    const {
      groups,
      isEditing,
      user,
      copy,
    } = this.props;
    if ((isEditing && !user) || (copy && !user)) return <Redirect to="/add" />;
    if (!groups) return <div><Spinner loading size="lg" /></div>;
    const initialValues = copy ? { ...user, userid: undefined } : user;
    return (
      <div>
        <h1>User add</h1>
        <RbacUserForm
          groups={groups}
          editDisabled={isEditing && initialValues.userid === 'admin'}
          newRecord={!isEditing}
          initialValues={initialValues
            ? { ...initialValues, groups: user.groups.map(({ groupId }) => groupId) }
            : undefined}
          onCancel={this.handleCancelClicked}
          onSave={values => (isEditing
            ? this.props.editUser(parseUserValues(values), user.id)
            : this.props.saveUser(parseUserValues(values)))}
        />
      </div>
    );
  }
}

const mapStateToProps = ({
  usersReducer: { groups, rows, selectedUsers },
}, {
  match: { url, params: { userId, copy } },
}) => {
  const isEditing = url.match(/^\/edit\/[0-9]+$/) && !!userId;
  const user = isEditing // eslint-disable-line no-nested-ternary
    ? rows.find(({ id }) => id === userId)
    : copy && selectedUsers ? selectedUsers[0] : undefined;
  return {
    groups,
    isEditing,
    user,
    copy,
  };
};

const mapDispatchToProps = dispatch => bindActionCreators({
  loadGroups,
  goBack,
  saveUser,
  editUser,
  createFlashMessage,
}, dispatch);

UserAdd.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.object),
  loadGroups: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  createFlashMessage: PropTypes.func.isRequired,
  saveUser: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  editUser: PropTypes.func.isRequired,
  user: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  copy: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

UserAdd.defaultProps = {
  groups: undefined,
  user: undefined,
  copy: undefined,
  isEditing: false,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserAdd);
