import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import { RbacUserPreview, RbacUserTagsList } from '@manageiq/react-ui-components/dist/rbac-forms';
import { Spinner, Grid, Row, Col, FormGroup, Icon } from 'patternfly-react';
import PropTypes from 'prop-types';
import { resetSelectedUsers, fetchCustomEventsIfNeeded } from '../redux/actions';
import { http } from '../../../http_api';

export class UserDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.updateUserTags();
    this.props.fetchCustomEventsIfNeeded(this.props.user.id);
  }

  componentDidUpdate({ user: { id } }) {
    if (id !== this.props.user.id) {
      this.updateUserTags();
      this.props.fetchCustomEventsIfNeeded(this.props.user.id);
    }
  }

  handleLoadUserTags = userId => http.get(`/ops/user_tags?user_id=${userId}`).then(data => this.setState({ ...data }));
  updateUserTags = () => {
    this.props.resetSelectedUsers([this.props.user]);
    this.handleLoadUserTags(this.props.user.id);
  }

  render() {
    const { customEvents } = this.props;
    const { tenant, tags } = this.state;
    if (!tenant || !tags) return <div><Spinner loading size="lg" /></div>;
    return (
      <div>
        <RbacUserPreview user={this.props.user} />
        <div className="form-horizontal rbac-user-preview">
          <Grid fluid>
            <Row>
              <FormGroup>
                <Col md={2} componentClass="label" className="control-label">
                  Custom button events
                </Col>
                <Col md={8}>
                  { customEvents && customEvents.length > 0
                    ? <Fragment><Icon type="fa" name="star" />&nbsp;<Link to={`${this.props.match.url}/custom-button-events`}>{customEvents.length}</Link></Fragment>
                    : customEvents && customEvents.length === 0 ? 'None' : <Spinner inline loading size="sm" />}
                </Col>
              </FormGroup>
            </Row>
          </Grid>
        </div>
        <hr />
        <RbacUserTagsList tags={tags} tenant={tenant} />
      </div>
    );
  }
}

const mapStateToProps = ({
  usersReducer: {
    rows,
    userCustomEvents,
  },
}, { match: { params: { userId } } }) => ({
  user: rows.find(({ id }) => id === userId),
  customEvents: userCustomEvents[userId],
});

const mapDispatchToProps = dispatch => bindActionCreators({
  resetSelectedUsers,
  fetchCustomEventsIfNeeded,
}, dispatch);

UserDetail.propTypes = {
  resetSelectedUsers: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  fetchCustomEventsIfNeeded: PropTypes.func.isRequired,
  customEvents: PropTypes.arrayOf(PropTypes.object),
};

UserDetail.defaultProps = {
  customEvents: undefined,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserDetail);
