import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { API } from '../../http_api';
import MiqFormRenderer from '../../forms/data-driven-form';
import schema from './domain-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import handleFailure from '../../helpers/handle-failure';

const getInitialValues = id => API.get(`/api/automate_domains/${id}?attributes=name,description,enabled,source`);

const handleSubmit = (id, values, redirectUrl) => {
  miqSparkleOn(); // miqRedirectBack turns it off
  const action = id ? 'edit' : 'create';
  const flashMessage = sprintf(id
    ? __('Automate Domain "%s" was saved')
    : __('Automate Domain "%s" was added'), values.name);

  API.post(`/api/automate_domains/${id || ''}`, {
    action, ...values,
  }, { skipErrors: [400] })
    .then(() => miqRedirectBack(flashMessage, 'success', redirectUrl))
    .catch(handleFailure);
};

const NamespaceForm = ({ id }) => {
  const [state, setState] = useState({
    name: '', description: '', enabled: true, readonly: false, loaded: false,
  });
  const redirectUrl = '/miq_ae_class/explorer';
  const cancelMessage = state.name
    ? sprintf(__('Editing "%s" Automate Domain was cancelled by user.'), state.name)
    : __('Creating Automate Domain was cancelled by user.');

  useEffect(() => {
    if (!state.loaded && id) {
      miqSparkleOn();
      getInitialValues(id).then(({
        name, description, enabled, source,
      }) => {
        // FIXME Retrieve readability from the API directly instead of the source (property is missing from the API)
        const readonly = ['user', 'user_locked'].includes(source);
        setState({
          name, description, enabled, readonly, loaded: true,
        });
        miqSparkleOff();
      }).catch(handleFailure);
    }
  }, []);

  return (
    <MiqFormRenderer
      initialValues={{ name: state.name, description: state.description, enabled: state.enabled }}
      schema={schema(state.readonly)}
      onSubmit={values => handleSubmit(id, values, redirectUrl)}
      onReset={() => add_flash(__('All changes have been reset'), 'warn')}
      onCancel={() => miqRedirectBack(cancelMessage, 'warning', redirectUrl)}
      canReset={id}
    />
  );
};

NamespaceForm.propTypes = {
  id: PropTypes.number, // If undefined or null then renders the new domain form
};

NamespaceForm.defaultProps = {
  id: undefined,
};

export default NamespaceForm;
