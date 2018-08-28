import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Spinner } from 'patternfly-react';
import { goBack } from 'connected-react-router';
import { RbacUserForm } from '@manageiq/react-ui-components/dist/rbac-forms';
import { loadGroups, saveUser } from '../redux/actions';

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
    const { groups, goBack, saveUser } = this.props;
    if (!groups) return <div><Spinner loading size="lg" /></div>;
    return (
      <div>
        <h1>User add</h1>
        <RbacUserForm
          groups={groups}
          newRecord
          onCancel={goBack}
          onSave={values => {
            console.log('values: ', values)
            saveUser(parseUserValues(values));
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ usersReducer: { groups } }) => ({
  groups,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  loadGroups,
  goBack,
  saveUser,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(UserAdd);