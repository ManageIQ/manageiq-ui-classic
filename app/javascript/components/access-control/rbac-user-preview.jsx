import React from 'react';
import {
  Grid,
  Row,
  Col,
  FormGroup,
  Icon,
} from 'patternfly-react';
import PropTypes from 'prop-types';

const previewLink = (value, icon, onClick, key) => (
  <p className="form-control-static" key={key}>
    <i className={`ff ff-${icon}`} />
    <a
      style={{ marginLeft: 5 }}
      className="pointer"
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
      href="#"
    >
      {value}
    </a>
  </p>
);

const renderGroups = groups => groups.map(group => previewLink(group.label, group.icon, group.onClick, group.groupId));

const PreviewRow = ({ label, children }) => (
  <Row>
    <FormGroup>
      <Col md={2} componentClass="label" className="control-label">
        {label}
      </Col>
      <Col md={8}>
        {children}
      </Col>
    </FormGroup>
  </Row>
);

PreviewRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

const RbacUserPreview = ({
 user, onEventClick, customEvents, permission 
}) => (
  <div className="form-horizontal rbac-user-preview">
    <Grid fluid>
      <PreviewRow label={__('Full Name')}>
        <p className="form-control-static">{user.name}</p>
      </PreviewRow>
      <PreviewRow label={__('Username')}>
        <p className="form-control-static">{user.userid}</p>
      </PreviewRow>
      <PreviewRow label={__('E-mail Address')}>
        <p className="form-control-static">{user.email}</p>
      </PreviewRow>
      <PreviewRow label={__('Current group')}>
        {previewLink(user.current_group.label, 'group', user.current_group.onClick)}
      </PreviewRow>
      <PreviewRow label={__('Groups')}>
        {renderGroups(user.groups)}
      </PreviewRow>
      <PreviewRow label={__('Role')}>
        {previewLink(user.role.label, 'user-role', user.role.onClick)}
      </PreviewRow>
      { permission && (
      <PreviewRow label={__('Custom button events')}>
        {previewLink(customEvents.length, 'hexagon', onEventClick)}
      </PreviewRow>
      )}
    </Grid>
  </div>
);

RbacUserPreview.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    userid: PropTypes.string.isRequired,
    email: PropTypes.string,
    current_group: PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    }),
    groups: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      groupId: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    })),
    role: PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    }),
  }).isRequired,
};

export default RbacUserPreview;
