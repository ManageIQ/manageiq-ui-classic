import React, { useEffect, useState } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './network-routers-interfaces-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const InterfacesForm = ({ interfaces, add, routerId }) => {
  const [{ initialValues, isLoading }, setState] = useState({ isLoading: !!routerId });

  const onSubmit = (values) => {
    if (add) {
      const url = `/network_router/add_interface/${routerId}?button=add`;
      const data = initialValues;
      delete data.interface;
      data.cloud_subnet_id = values.interface;
      miqAjaxButton(url, data, { complete: false });
    } else {
      const url = `/network_router/remove_interface/${routerId}?button=remove`;
      const data = initialValues;
      delete data.interface;
      data.cloud_subnet_id = values.interface;
      miqAjaxButton(url, data, { complete: false });
    }
  };

  const onCancel = () => {
    let url = '';
    let message = __(`Adding or removing of interface was cancelled by the user.`);

    if (add) {
      message = __(`Adding of interface was cancelled by the user.`);
    } else {
      message = __(`Removing of interface was cancelled by the user.`);
    }
    url = `/network_router/show/${routerId}`;
    miqRedirectBack(message, 'warning', url);
  };

  useEffect(() => {
    if (isLoading) {
      miqSparkleOn();
      API.get(
        // eslint-disable-next-line max-len
        `/api/network_routers/${routerId}?attributes=name,admin_state_up,cloud_network_id,cloud_tenant.name,ext_management_system.id,ext_management_system.name,extra_attributes`
      )
        .then((initialValues) => {
          if (initialValues.extra_attributes
            && initialValues.extra_attributes.external_gateway_info
            && initialValues.extra_attributes.external_gateway_info.external_fixed_ips) {
            const ref = initialValues.extra_attributes.external_gateway_info.external_fixed_ips[0].subnet_id;
            API.get(`/api/cloud_subnets?expand=resources&attributes=name&filter[]=ems_ref=${ref}`).then((data) => {
              initialValues.interface = data.resources[0].id;
            })
              .then(() => {
                setState({
                  initialValues,
                  isLoading: false,
                });
              }).then(miqSparkleOff());
          } else {
            setState({
              initialValues,
              isLoading: false,
            });
            miqSparkleOff();
          }
        });
    }
  });

  return (
    <MiqFormRenderer
      initialValues={initialValues}
      schema={createSchema(interfaces, add)}
      canReset
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};

InterfacesForm.propTypes = {
  routerId: PropTypes.string.isRequired,
  interfaces: PropTypes.objectOf(PropTypes.any),
  add: PropTypes.bool,
};

InterfacesForm.defaultProps = {
  interfaces: undefined,
  add: false,
};

export default InterfacesForm;
