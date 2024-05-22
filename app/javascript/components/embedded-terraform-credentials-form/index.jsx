import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import { API } from '../../http_api';
import createSchema from './embedded-terraform-credentials-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const EmbeddedTerraformCredentialsForm = ({ recordId }) => {
  const [{ fields, initialValues, isLoading }, setState] = useState({ fields: [], isLoading: !!recordId });
  const promise = useMemo(() => API.options('/api/authentications'), []);
  const submitLabel = !!recordId ? __('Save') : __('Add');

  const loadSchema = (value, appendState = {}) => ({
    data: {
      // eslint-disable-next-line camelcase
      credential_types: { embedded_terraform_credential_types },
    },
  }) =>
    setState((state) => ({
      ...state,
      ...appendState,
      fields: embedded_terraform_credential_types[value].attributes,
    }));

  useEffect(() => {
    // eslint-disable-next-line camelcase
    API.get('/api/providers?collection_class=ManageIQ::Providers::EmbeddedTerraform::AutomationManager').then(({ resources: [manager_resource] }) => {
      if (!recordId) {
        setState((state) => ({
          ...state,
          initialValues: {
            manager_resource,
          },
          isLoading: false,
        }));
        return Promise.resolve({});
      }
      return API.get(`/api/authentications/${recordId}`).then((initialValues) => promise.then(loadSchema(initialValues.type, {
        initialValues: {
          ...initialValues,
        },
        isLoading: false,
      })));
    }).catch(() => {
      const message = __('Embedded Terraform service is not available.');
      miqRedirectBack(message, 'error', '/embedded_terraform_credential/show_list');
    });
  }, []);

  const onSubmit = (values) => {
    miqSparkleOn();

    const request = recordId ? API.patch(`/api/authentications/${recordId}`, values) : API.post('/api/authentications', values);
    request.then(() => {
      const message = sprintf(
        recordId
          ? __('Modification of Credential "%s" has been successfully queued.')
          : __('Add of Credential "%s" has been successfully queued.'),
        values.name,
      );
      miqRedirectBack(message, undefined, '/embedded_terraform_credential/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Credential "%s" was canceled by the user.')
        : __('Creation of new Credential was canceled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/embedded_terraform_credential/show_list');
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(fields, promise, !!recordId, loadSchema)}
      initialValues={initialValues}
      canReset={!!recordId}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
    />
  );
};

EmbeddedTerraformCredentialsForm.propTypes = {
  recordId: PropTypes.string,
};
EmbeddedTerraformCredentialsForm.defaultProps = {
  recordId: undefined,
};

export default EmbeddedTerraformCredentialsForm;
