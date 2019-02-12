import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  FormGroup,
  Col,
  Row,
  Icon,
} from 'patternfly-react';
import { RbacUserPreview, RbacUserTagsList } from '@manageiq/react-ui-components/dist/rbac-forms';

const UserDetails = ({
  user,
  permission,
  customEvents,
  tags,
  tenant,
  onEventClick,
}) => (
  <div>
    <h3>{__('User Information')}</h3>
    <RbacUserPreview user={user} />
    { permission && (
    <div className="form-horizontal rbac-user-preview">
      <Grid fluid>
        <Row>
          <div className="form-group">
            <Col md={2} componentClass="label" className="control-label">
              Custom button events
            </Col>
            <Col md={8}>
              <Icon type="fa" name="star" />
                  &nbsp;
              <a href="#" onClick={() => onEventClick('events')}>
                {customEvents.length}
              </a>
            </Col>
          </div>
        </Row>
      </Grid>
    </div>
    )}
    <hr />
    <RbacUserTagsList tags={tags} tenant={tenant} />
  </div>
);

UserDetails.propTypes = {
  user: PropTypes.object.isRequired,
  permission: PropTypes.bool.isRequired,
  customEvents: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  tenant: PropTypes.string.isRequired,
};

export default UserDetails;
