import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './pxe-server-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const REQUEST_ATTRIBUTES = [
  'access_url',
  'authentications',
  'customization_directory',
  'name',
  'pxe_directory',
  'pxe_menus',
  'uri',
  'windows_images_directory',
];

const RETURN_URL = '/pxe/explorer';

const PxeServersForm = ({ id }) => {
  const [initialValues, setInitialValues] = useState({});
  const [isLoading, setIsLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      miqSparkleOn();
      API.get(`/api/pxe_servers/${id}?attributes=${REQUEST_ATTRIBUTES}`)
        .then(({
          id: _id,
          href: _h,
          pxe_menus, // eslint-disable-line camelcase
          authentications,
          ...data
        }) => setInitialValues({
          ...data,
          pxe_menus: pxe_menus.map(({ file_name }) => ({ file_name })), // eslint-disable-line camelcase
          authentication: authentications[0] ? ({
            userid: authentications[0].userid,
          }) : ({}),
        }))
        .then(() => setIsLoading(false))
        .then(miqSparkleOff);
    }
  }, []);

  const onCancel = () => {
    const message = id
      ? sprintf(__('Edit of PXE Server %s was cancelled by the user'), initialValues.name)
      : __('Add of new PXE Server was cancelled by the user');
    miqRedirectBack(message, 'success', RETURN_URL);
  };

  const onSubmit = (values) => {
    miqSparkleOn();
    const message = id
      ? sprintf(__('PXE Server %s was saved'), values.name)
      : sprintf(__('PXE Server %s was added'), values.name);

    const pxeServer = {
      ...values,
      authentication: values.authentication ? ({
        userid: values.authentication.userid,
        password: values.authentication.password,
      }) : ({}),
    };
    const request = () => (id ? API.patch(`/api/pxe_servers/${id}`, pxeServer) : API.post('/api/pxe_servers', pxeServer));
    return request().then(() => miqRedirectBack(message, 'success', RETURN_URL)).catch(miqSparkleOff);
  };

  if (isLoading) {
    return null;
  }

  return (
    <Grid fluid>
      <MiqFormRenderer initialValues={initialValues} canReset={!!id} onSubmit={onSubmit} onCancel={onCancel} schema={createSchema(!!id)} />
    </Grid>
  );
};

PxeServersForm.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

PxeServersForm.defaultProps = {
  id: undefined,
};

export default PxeServersForm;
