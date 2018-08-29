import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RbacUserPreview } from '@manageiq/react-ui-components/dist/rbac-forms';
import { selectUsers } from '../redux/actions';

class UserDetail extends Component {
  componentDidMount() {
    this.props.selectUsers([this.props.user]);
  }

  componentDidUpdate({ user: { id } }) {
    if (id !== this.props.user.id) this.props.selectUsers([this.props.user]);
  }
  
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

const mapDispatchToProps = dispatch => bindActionCreators({
  selectUsers,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(UserDetail);