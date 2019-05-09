import React from 'react';
import PropTypes from 'prop-types';

import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import orchestrationFormSchema from './orchestration-template-form.schema';

const OrcherstrationTemplateForm = ({ managers }) => {
  const schema = orchestrationFormSchema(managers);
  return (
    <Grid fluid>
      <h1>There will be dragons</h1>
      <MiqFormRenderer
        schema={schema}
        onSubmit={console.log}
      />
    </Grid>
  );
};

OrcherstrationTemplateForm.propTypes = {
  managers: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string).isRequired).isRequired,
};

export default OrcherstrationTemplateForm;
