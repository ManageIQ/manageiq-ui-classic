import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'carbon-components-react';
import MiqFormRenderer from '@@ddf';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './cloud-tenant-form.schema';

const CloudTenantForm = ({ recordId }) => {
  const [{ isLoading, initialValues, emsId }, setState] = useState({ isLoading: !!recordId, initialValues: {} });

  useEffect(() => {
    if (recordId) {
      API.get(`/api/cloud_tenants/${recordId}`).then((initialValues) => {
        setState((state) => ({ ...state, initialValues, isLoading: false }));
      });
    }
  }, [recordId]);

  const onSubmit = (values) => {
    miqSparkleOn();
    const request = recordId ? API.patch(`/api/cloud_tenants/${recordId}`, values) : API.post('/api/cloud_tenants', values);

    request.then(() => {
      const message = sprintf(recordId
        ? __('Modification of Cloud Tenant %s has been successfully queued')
        : __('Add of Cloud Tenant "%s" has been successfully queued.'),
      values.name);

      miqRedirectBack(message, 'success', '/cloud_tenant/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Cloud Tenant "%s" was canceled by the user.')
        : __('Creation of new Cloud Tenant was canceled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/cloud_tenant/show_list');
  };

  return !isLoading && (
    <Grid>
      <MiqFormRenderer
        initialValues={initialValues}
        schema={createSchema(recordId, emsId, setState)}
        onSubmit={onSubmit}
        onCancel={onCancel}
        canReset={!!recordId}
        buttonsLabels={{
          submitLabel: recordId ? __('Save') : __('Add'),
        }}
      />
    </Grid>
  );
};

CloudTenantForm.propTypes = {
  recordId: PropTypes.string,
};

CloudTenantForm.defaultProps = {
  recordId: undefined,
};

export default CloudTenantForm;
