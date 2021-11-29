import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'carbon-components-react';
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

const copyStack = (values, message, otId) => {
  const resources = {};
  resources.templateId = otId;
  resources.templateName = values.name;
  resources.templateDescription = values.description;
  resources.templateDraft = values.draft;
  resources.templateContent = values.content;
  miqAjaxButton(`/orchestration_stack/stacks_ot_copy?button=add`, resources);
};

const OrcherstrationTemplateForm = ({ isStack, otId, copy }) => {
  const [initialValues, setinItialValues] = useState({});
  const [submitAction, setSubmitAction] = useState();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (isStack) {
      setSubmitAction(() => copyStack);
    } else {
      // eslint-disable-next-line no-nested-ternary
      setSubmitAction(() => (copy ? copyTemplate : otId ? updateTemplate : submitNewTemplate));
    }
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
    let successMessage;
    if (isStack) {
      successMessage = `Orchestration Template "${values.name}" was saved`;
    } else {
      successMessage = otId ? sprintf(__('Orchestration Template %s was saved'), values.name)
        : sprintf(__('Orchestration Template %s was successfully created'), values.name);
    }
    return submitAction(values, successMessage, otId);
  };

  const onCancel = () => {
    let cancelMessage;
    if (isStack) {
      cancelMessage = __('Copy of Orchestration Template was cancelled by the user');
      miqRedirectBack(cancelMessage, 'success', `/orchestration_stack/show/${otId}?display=stack_orchestration_template#/`);
    } else {
      cancelMessage = otId
        ? sprintf(__('Edit of Orchestration Template %s was cancelled by the user'), initialValues.name)
        : __('Creation of a new Orchestration Template was cancelled by the user');
      miqRedirectBack(cancelMessage, 'success', '/catalog/explorer');
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Grid>
      <MiqFormRenderer
        schema={schema}
        onSubmit={onSubmit}
        initialValues={initialValues}
        onCancel={onCancel}
        canReset={!!otId && !copy}
        buttonsLabels={{
          submitLabel: otId && !copy ? __('Save') : __('Add'),
        }}
      />
    </Grid>
  );
};

OrcherstrationTemplateForm.propTypes = {
  isStack: PropTypes.bool,
  otId: PropTypes.number,
  copy: PropTypes.bool,
};

OrcherstrationTemplateForm.defaultProps = {
  isStack: false,
  otId: undefined,
  copy: false,
};

export default OrcherstrationTemplateForm;
