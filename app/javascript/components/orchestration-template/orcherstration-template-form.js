import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Grid } from 'patternfly-react';

import { API } from '../../http_api';
import MiqFormRenderer from '../../forms/data-driven-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import orchestrationFormSchema from './orchestration-template-form.schema';

const submitNewTemplate = (values, message) => API.post('/api/orchestration_templates', values, { skipErrors: [400, 500] })
  .then(() => miqRedirectBack(message, 'success', '/catalog/explorer'))
  .catch((apiResult) => {
    add_flash(apiResult.data.error.message, 'error');
    miqSparkleOff();
  });

const updateTemplate = (values, message, otId) => API.patch(`/api/orchestration_templates/${otId}`, values, { skipErrors: [400, 500] })
  .then(() => miqRedirectBack(message, 'success', '/catalog/explorer'))
  .catch((apiResult) => {
    add_flash(apiResult.data.error.message, 'error');
    miqSparkleOff();
  });

const copyTemplate = (values, message, otId) => API.post(`/api/orchestration_templates/${otId}`, {
  action: 'copy',
  resource: values,
}).then(() => miqRedirectBack(message, 'success', '/catalog/explorer'))
  .catch(() => miqSparkleOff());

const OrcherstrationTemplateForm = ({ otId, copy }) => {
  const [initialValues, setinItialValues] = useState({});
  const [submitAction, setSubmitAction] = useState();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line no-nested-ternary
    setSubmitAction(() => (copy ? copyTemplate : otId ? updateTemplate : submitNewTemplate));
    if (otId) {
      API.get(`/api/orchestration_templates/${otId}?attributes=name,description,type,ems_id,draft,content`)
        .then((data) => {
          setinItialValues(copy ? { ...data, name: `Copy of ${data.name}` } : data);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const schema = orchestrationFormSchema(!!otId, copy, initialValues);

  const onSubmit = ({ href: _href, id: _id, ...values }) => {
    miqSparkleOn();
    const successMessage = otId
      ? sprintf(__('Orchestration Template %s was saved'), values.name)
      : sprintf(__('Orchestration Template %s was successfully created'), values.name);
    return submitAction(values, successMessage, otId);
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
        canReset={!!otId && !copy}
        buttonsLabels={{
          submitLabel: otId && !copy ? __('Save') : __('Add'),
        }}
      />
    </Grid>
  );
};

OrcherstrationTemplateForm.propTypes = {
  otId: PropTypes.number,
  copy: PropTypes.bool,
};

OrcherstrationTemplateForm.defaultProps = {
  otId: undefined,
  copy: false,
};

export default OrcherstrationTemplateForm;
