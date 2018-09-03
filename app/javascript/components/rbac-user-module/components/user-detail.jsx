import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RbacUserPreview, RbacUserTagsList } from '@manageiq/react-ui-components/dist/rbac-forms';
import { Spinner } from 'patternfly-react';
import PropTypes from 'prop-types';
import { resetSelectedUsers } from '../redux/actions';
import { http } from '../../../http_api';

export class UserDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.resetSelectedUsers([this.props.user]);
    this.handleLoadUserTags(this.props.user.id);
  }

  componentDidUpdate({ user: { id } }) {
    if (id !== this.props.user.id) {
      this.props.resetSelectedUsers([this.props.user]);
      this.handleLoadUserTags(this.props.user.id);
    }
  }

  handleLoadUserTags = userId => http.get(`/ops/get_user_tags?user_id=${userId}`).then(data => this.setState({ ...data }));

  render() {
    const { tenant, tags } = this.state;
    if (!tenant || !tags) return <div><Spinner loading size="lg" /></div>;
    return (
      <div>
        <RbacUserPreview user={this.props.user} />
        <hr />
        <RbacUserTagsList tags={tags} tenant={tenant} />
      </div>
    );
  }
}

const mapStateToProps = ({ usersReducer: { rows } }, { match: { params: { userId } } }) => ({
  user: rows.find(({ id }) => id === userId),
});

const mapDispatchToProps = dispatch => bindActionCreators({
  resetSelectedUsers,
}, dispatch);

UserDetail.propTypes = {
  resetSelectedUsers: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserDetail);
