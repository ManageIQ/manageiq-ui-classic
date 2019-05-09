import React from 'react';
import PropTypes from 'prop-types';

import { Grid } from 'patternfly-react';

import { API } from '../../http_api';
import MiqFormRenderer from '../../forms/data-driven-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import orchestrationFormSchema from './orchestration-template-form.schema';

const OrcherstrationTemplateForm = ({ managers }) => {
  const schema = orchestrationFormSchema(managers);
  const onSubmit = (values) => {
    miqSparkleOn();
    API.post('/api/orchestration_templates', values)
      .then(() => miqRedirectBack(
        sprintf(__('Service Dialog %s was successfully created'), values.name),
        'success',
        '/catalog/explorer',
      ))
      .catch(() => {
        /**
         * API errors should be handled by the global error handling
         */
        miqSparkleOff();
      });
  };
  return (
    <Grid fluid>
      <MiqFormRenderer
        schema={schema}
        onSubmit={onSubmit}
        onCancel={() => miqRedirectBack(
          __('Creation of a new Service Dialog was cancelled by the user'),
          'success',
          '/catalog/explorer',
        )}
        buttonsLabels={{
          submitLabel: __('Add'),
        }}
      />
    </Grid>
  );
};

OrcherstrationTemplateForm.propTypes = {
  managers: PropTypes.arrayOf(PropTypes.array.isRequired).isRequired,
};

export default OrcherstrationTemplateForm;
