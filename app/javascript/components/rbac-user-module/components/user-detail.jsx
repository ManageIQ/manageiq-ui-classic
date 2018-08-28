import React, { Component } from 'react';
import { RbacUserPreview } from '@manageiq/react-ui-components/dist/rbac-forms';
import { connect } from 'react-redux';

class UserDetail extends Component {
  render() {
    return (
      <div>
        <RbacUserPreview user={this.props.user} />
      </div>
    );
  }
}

const mapStateToProps = ({ usersReducer: { rows } }, { match: { params: { userId } } }) => ({
  user: rows.find(({ id }) => id === userId),
});

export default connect(mapStateToProps)(UserDetail);