import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Grid } from 'patternfly-react';

import { API } from '../../http_api';
import MiqFormRenderer from '../../forms/data-driven-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import orchestrationFormSchema from './orchestration-template-form.schema';

const OrcherstrationTemplateForm = ({ managers, otId }) => {
  const [initialValues, setinitialValues] = useState({});
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (otId) {
      API.get(`/api/orchestration_templates/${otId}?attributes=name,description,type,ems_id,draft,content`)
        .then((data) => {
          setinitialValues(data);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const schema = orchestrationFormSchema(managers, !!otId);

  const onSubmit = (values) => {
    miqSparkleOn();
    const sucessMessage = sprintf(__(`Orchestration Template %s was ${otId ? 'saved' : 'successfully created'}`), values.name);
    if (otId) {
      return API.patch(`/api/orchestration_templates/${otId}`, values)
        .then(() => miqRedirectBack(sucessMessage, 'success', '/catalog/explorer'))
        .catch(() => miqSparkleOff());
    }

    return API.post('/api/orchestration_templates', values)
      .then(() => miqRedirectBack(sucessMessage, 'success', '/catalog/explorer'))
      .catch(() => miqSparkleOff());
  };


  if (isLoading) {
    return null;
  }

  const cancelMessage = otId
    ? sprintf(__('Edit of Orchestration Template %s was cancelled by the user'), initialValues.name)
    : __('Creation of a new Orchestration Template was cancelled by the user');

  return (
    <Grid fluid>
      <MiqFormRenderer
        schema={schema}
        onSubmit={onSubmit}
        initialValues={initialValues}
        onCancel={() => miqRedirectBack(cancelMessage, 'success', '/catalog/explorer')}
        canReset={!!otId}
        onReset={() => add_flash(__('All changes have been reset'), 'warning')}
        buttonsLabels={{
          submitLabel: otId ? __('Save') : __('Add'),
        }}
      />
    </Grid>
  );
};

OrcherstrationTemplateForm.propTypes = {
  managers: PropTypes.arrayOf(PropTypes.array.isRequired),
  otId: PropTypes.number,
};

OrcherstrationTemplateForm.defaultProps = {
  otId: undefined,
  managers: [],
};

export default OrcherstrationTemplateForm;
