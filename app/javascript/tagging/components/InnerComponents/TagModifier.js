import React from 'react';
import PropTypes from 'prop-types';
import { Form, Grid, Column } from '@carbon/react';

const TagModifier = ({ header, hideHeader, children }) => (
  <>
    { !hideHeader
      && (
        <Grid className="tag-modifier-header">
          <Column sm={4} md={8} lg={16}>
            <h4>{header}</h4>
          </Column>
        </Grid>
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
