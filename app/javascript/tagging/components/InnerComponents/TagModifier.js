import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Form } from 'patternfly-react';
import { __ } from '../../../global-functions';

const TagModifier = ({ header, hideHeader, children }) => {
  const h = hideHeader ? null : (
    <Row>
      <Col lg={12}>
        <h2>{header}</h2>
      </Col>
    </Row>);
  return (
    <React.Fragment>
      {h}
      <Form horizontal>{children}</Form>
    </React.Fragment>);
};

TagModifier.propTypes = {
  header: PropTypes.string,
  hideHeader: PropTypes.bool,
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
};

TagModifier.defaultProps = {
  header: __('Add/Modify tag'),
  hideHeader: false,
};

export default TagModifier;
