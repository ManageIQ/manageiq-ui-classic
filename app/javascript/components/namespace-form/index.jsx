import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { API } from '../../http_api';
import MiqFormRenderer from '../../forms/data-driven-form';
import schema from './namespace-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import handleFailure from '../../helpers/handle-failure';

const getInitialValues = (isDomain, namespaceId, f) => {
  miqSparkleOn();
  API.get(`/api/automate_${isDomain ? 'domains' : 'namespaces'}/${namespaceId}?attributes=name,description,enabled,source`).then(({
    name, description, enabled, source,
  }) => {
    miqSparkleOff();
    f.setInitialValues({ name, description, enabled });
    // FIXME Retrieve readability from the API directly instead of the source (property is missing from the API)
    f.setDisabled(!['user', 'user_locked'].includes(source));
  });
};

const handleSubmit = (isDomain, namespaceId, parentId, values, redirectUrl) => {
  miqSparkleOn(); // miqRedirectBack turns it off
  const action = namespaceId ? 'edit' : 'create';
  const flashMessage = sprintf(__('Automate %s "%s" was %s.'),
    isDomain ? 'Domain' : 'Namespace',
    values.name,
    namespaceId ? 'saved' : 'added');

  // The same component is being used for ae_domains and ae_namespaces
  API.post(`/api/automate_${isDomain ? 'domains' : 'namespaces'}/${namespaceId || ''}`, {
    action, parent_id: parentId, ...values,
  }, { skipErrors: [400] })
    .then(() => miqRedirectBack(flashMessage, 'success', redirectUrl))
    .catch(handleFailure);
};

const NamespaceForm = ({ isDomain, namespaceId, parentId }) => {
  const [initialValues, setInitialValues] = useState({ name: '', description: '', enabled: true });
  const [disabled, setDisabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const redirectUrl = '/miq_ae_class/explorer';
  const cancelMessage = sprintf(__('%s of %s "%s" was cancelled by user.'),
    initialValues.name ? 'Edit' : 'Add',
    isDomain ? 'Domain' : 'Namespace',
    initialValues.name || '');

  useEffect(() => {
    if (!loaded && namespaceId) {
      getInitialValues(isDomain, namespaceId, { setInitialValues, setDisabled });
      setLoaded(true);
    }
  }, []);

  return (
    <MiqFormRenderer
      initialValues={initialValues}
      schema={schema(isDomain, disabled)}
      onSubmit={values => handleSubmit(isDomain, namespaceId, parentId, values, redirectUrl)}
      onReset={() => add_flash(__('All changes have been reset'), 'warn')}
      onCancel={() => miqRedirectBack(cancelMessage, 'warning', redirectUrl)}
      canReset={namespaceId}
    />
  );
};

NamespaceForm.propTypes = {
  isDomain: PropTypes.bool,
  namespaceId: PropTypes.number, // If undefined or null then renders the new namespace form
  parentId: PropTypes.number,
};

NamespaceForm.defaultProps = {
  isDomain: false,
  namespaceId: undefined,
  parentId: undefined,
};

export default NamespaceForm;
