/* eslint-disable camelcase */
import React, { useState } from 'react';
import { Loading } from 'carbon-components-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './cloud-object-store-container-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const CloudObjectStoreContainerForm = () => {
  const [{
    initialValues, fields, isLoading,
  }, setState] = useState({});

  const loadSchema = (appendState = {}) => ({ data: { form_schema: { fields } } }) => {
    miqSparkleOff();
    setState({
      ...appendState,
      fields,
    });
  };

  const emptySchema = (appendState = {}) => {
    const fields = [];
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
    }));
  };

  const onSubmit = (values) => {
    // AWS values match old form, need to ask about Openstack values
    const submitData = {
      name: values.name,
      ems_id: values.storage_manager_id,
    };
    const url = '/cloud_object_store_container/show_list#/';

    if (values.provider_region) {
      submitData.region = values.provider_region;
    } else if (values.cloud_tenant_id) {
      submitData.cloud_tenant_id = values.cloud_tenant_id;
    }
    miqSparkleOn();
    API.post('/api/cloud_object_store_containers/', submitData).then(() => {
      const message = sprintf(__(`Add of Cloud Object Store Container "%s" has been successfully queued.`), values.name);
      miqRedirectBack(message, 'success', url);
    })
      .catch((error) => {
        const message = sprintf(__(`Add of Cloud Object Store Container "%s" has failed with error: %s`), values.name, error.data.error.message);
        miqRedirectBack(message, 'warning', url);
      });
  };

  const onCancel = () => {
    miqSparkleOn();
    const url = '/cloud_object_store_container/show_list#/';
    const message = __('Adding of new cloud object store container was cancelled by the user.');
    miqRedirectBack(message, 'warning', url);
  };

  const validation = (values) => {
    const errors = {};
    if (values.storage_manager_id === '-1') {
      errors.storage_manager_id = __('Required');
    }
    return errors;
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(fields, loadSchema, emptySchema)}
      initialValues={initialValues}
      validate={validation}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel: __('Add') }}
    />
  );
};

export default CloudObjectStoreContainerForm;
