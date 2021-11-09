import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import createSchema from './RoutersForm.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { API } from '../../http_api';

const RoutersForm = ({ routerId }) => {
  const [{
    initialValues, isLoading, fields, subnets,
  }, setState] = useState({
    isLoading: !!routerId, fields: [], subnetSelect: [], subnets: [],
  });
  const submitLabel = !!routerId ? __('Save') : __('Add');

  let network = '';

  const getSubmitData = (values) => {
    const resources = {};
    resources.admin_state_up = values.admin_state_up;
    resources.cloud_tenant_id = values.cloud_tenant_id;
    resources.ems_id = values.ems_id;
    resources.name = values.name;

    if (values.enable) {
      if (values.cloud_network_id) {
        resources.network_id = values.cloud_network_id;
        resources.cloud_network_id = values.cloud_network_id;
        if (values.subnet_id) {
          resources.cloud_subnet_id = values.subnet_id;
        }
      }
      resources.enable_snat = values.external_gateway_info.enable_snat;
    }
    return resources;
  };

  const formatInitialData = (data) => {
    const initialValues = data;
    initialValues.enable = !!initialValues.extra_attributes.external_gateway_info;
    if (initialValues.enable) {
      initialValues.source_nat = initialValues.extra_attributes.external_gateway_info.enable_snat;
      if (initialValues.network_id) {
        initialValues.subnet_id = initialValues.extra_attributes.external_gateway_info.external_fixed_ips[0]
          ? initialValues.extra_attributes.external_gateway_info.external_fixed_ips[0].subnet_id : -1;
      }
    }
    if (initialValues.cloud_network.cloud_subnets.ids) {
      initialValues.cloud_subnet_id = `${initialValues.cloud_network.cloud_subnets.ids[0]}`;
    }
    return initialValues;
  };

  const callAPI = (value) => {
    API.get(`/api/cloud_subnets?expand=resources&attributes=name,ems_ref&filter[]=cloud_network_id=${value}`).then((data) => {
      let subnets = data.resources;
      subnets = subnets.map(({ id, name }) => ({ label: name, value: id }));
      setState((state) => ({
        ...state,
        subnets,
      }));
    });
  };

  const loadSchema = (appendState = {}) => ({ data: { form_schema: { fields } } }) => {
    Object.assign(fields[2].fields[2], {
      resolveProps: (props, { meta, input }) => {
        if (input.value && meta.active) {
          if (input.value !== network) {
            callAPI(input.value);
            network = input.value;
          }
        }
      },
    });
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
    }));
  };

  const emptySchema = (appendState = {}) => {
    const fields = [];
    const subnetSelect = [];
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
      subnetSelect,
    }));
  };

  useEffect(() => {
    if (routerId && isLoading) {
      miqSparkleOn();
      API.get(`/api/network_routers/${routerId}?attributes=cloud_network.cloud_subnets.ids,external_gateway_info`)
        .then((initialValues) => {
          const data = formatInitialData(initialValues);
          API.get(
            `/api/cloud_subnets?expand=resources&attributes=name,ems_ref&filter[]=cloud_network_id=${data.cloud_network_id}`
          ).then((data) => {
            let subnets = data.resources;
            subnets = subnets.map(({ id, name }) => ({ label: name, value: id }));
            setState((state) => ({
              ...state,
              subnets,
            }));
          });
          setState({
            initialValues,
            isLoading: false,
          });
          API.options(`/api/network_routers/${routerId}`).then(
            loadSchema({})
          );
          miqSparkleOff();
        });
    }
  }, [routerId]);

  const onSubmit = (values) => {
    const resources = getSubmitData(values);

    if (values.ems_id !== '-1') {
      miqSparkleOn();
      const request = routerId ? API.patch(`/api/network_routers/${routerId}`, resources) : API.post('/api/network_routers', resources);
      const url = routerId ? `/network_router/show/${routerId}` : '/network_router';
      request.then(() => {
        const message = sprintf(routerId
          ? __('Editing of Network Router %s has been successfully queued')
          : __('Adding of Network Router %s has been successfully queued.'),
        resources.name);
        miqRedirectBack(message, 'success', url);
      }).catch(miqSparkleOff);
    }
  };

  const onCancel = () => {
    let url = '';
    let message = '';
    if (!!routerId) {
      url = `/network_router/show/${routerId}`;
      message = __(`Editing of Network Router ${initialValues.name} was cancelled by the user.`);
    } else {
      url = '/network_router';
      message = __(`Adding of new Network Router was cancelled by the user.`);
    }
    miqRedirectBack(message, 'warning', url);
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(!!routerId, fields, subnets, loadSchema, emptySchema)}
      initialValues={initialValues}
      canReset={!!routerId}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
      canSubmit={false}
    />
  );
};

RoutersForm.propTypes = {
  routerId: PropTypes.string,
};
RoutersForm.defaultProps = {
  routerId: undefined,
};

export default RoutersForm;
