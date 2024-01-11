import React from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Column } from 'carbon-components-react';

const TagModifier = ({ header, hideHeader, children }) => (
  <>
    { !hideHeader
      && (
        <Row className="tag-modifier-header">
          <Column lg={12}>
            <h4>{header}</h4>
          </Column>
        </Row>
      ) }
    <Form horizontal="true" className="tag-modifier-form">{children}</Form>
  </>
);

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
