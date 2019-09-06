import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import createSchema from './ops-tenant-form.schema';
import MiqFormRenderer from '../../forms/data-driven-form';
import { API, http } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import handleFailure from '../../helpers/handle-failure';

const OpsTenantForm = ({
  recordId,
  divisible,
  redirectUrl,
  ancestry,
}) => {
  const [initialValues, setInitialValues] = useState({});
  const [isLoading, setLoading] = useState(!!recordId);
  const entity = divisible || initialValues.divisible ? __('Tenant') : __('Project');
  useEffect(() => {
    if (recordId) {
      miqSparkleOn();
      API.get(`/api/tenants/${recordId}?expand=resources&attributes=name,description,use_config_for_attributes,ancestry,divisible`)
        .then(setInitialValues)
        .then(() => {
          miqSparkleOff();
          setLoading(false);
        })
        .catch((error) => {
          miqSparkleOff();
          setLoading(false);
          throw (error);
        });
    }
  }, []);

  const handleCancel = () => (!recordId
    ? miqRedirectBack(sprintf(__('Creation of new %s was canceled by the user.'), entity), 'warning', redirectUrl)
    : miqRedirectBack(sprintf(__('Edit of %s "%s" was canceled by the user.'), entity, initialValues.name), 'warning', redirectUrl));

  const save = (values, method, url, message) => {
    miqSparkleOn();
    return API[method](url, values, { skipErrors: [400] })
      .then(() => http.post('/ops/invalidate_miq_product_feature_caches', {}))
      .then(() => miqRedirectBack(message, 'success', redirectUrl))
      .catch((...args) => {
        miqSparkleOff();
        return handleFailure(...args);
      });
  };

  const handleSubmit = ({
    href: _href,
    id: _id,
    ancestry: _ancestry,
    ...values
  }) => {
    if (recordId) {
      return save(
        { ...values, divisible: initialValues.divisible },
        'put',
        `/api/tenants/${recordId}`,
        sprintf(__('%s "%s" has been successfully saved.'), entity, values.name),
      );
    }

    return save(
      { ...values, divisible, parent: { id: ancestry } },
      'post',
      '/api/tenants',
      sprintf(__('%s "%s" has been successfully added.'), entity, values.name),
    );
  };

  if (isLoading) {
    return null;
  }

  return (
    <div>
      <MiqFormRenderer
        initialValues={initialValues}
        schema={createSchema(!recordId, !initialValues.ancestry, ancestry || initialValues.ancestry, initialValues.id)}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        canReset={!!recordId}
        onReset={() => add_flash(__('All changes have been reset'), 'warning')}
        buttonsLabels={{
          submitLabel: !!recordId ? __('Save') : __('Add'),
        }}
      />
    </div>
  );
};

OpsTenantForm.propTypes = {
  recordId: (props, propName, componentName) => { // eslint-disable-line react/require-default-props
    const value = props[propName];
    if (!(typeof value === 'string' || typeof value === 'number' || value === null)) {
      return new Error(`Invalida prop '${propName}' supplied to ${componentName}. Expected number, string or null.`);
    }
    return undefined;
  },
  divisible: PropTypes.bool.isRequired,
  redirectUrl: PropTypes.string.isRequired,
  ancestry: PropTypes.any, // eslint-disable-line react/forbid-prop-types
};

OpsTenantForm.defaultProps = {
  ancestry: undefined,
};

export default OpsTenantForm;
