import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import createSchema from './authentication.schema';
import MiqFormRenderer from '../../forms/data-driven-form';
import { API } from '../../http_api';
import mapper from '../../forms/mappers/componentMapper';
import ValidateProviderCredentials from '../provider-form/validate-provider-credentials';

const AuthenticationForm = ({ server: { id, name }, product, zone }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [initialValues, setInitialValues] = useState({});
//   const [amazonEdit, setAmazonEdit] = useState(true);
//   const [edit, setEdit] = useState(true);
  const [{ isLoading, initialValues, editMode }, setState] = useState({ isLoading: true, editMode: false });
  const [key, setKey] = useState('');

  useEffect(() => {
    miqSparkleOn();
    API.get(`/api/servers/${id}/settings`).then(({ authentication, session }) => {
      const hours = Math.floor(session.timeout / 3600).toString();
      // eslint-disable-next-line no-mixed-operators
      const minutes = (session.timeout % 3600 / 60).toString();
      const data = {
        mode: authentication.mode,
        session_timeout_hours: hours,
        session_timeout_mins: minutes,
        amazon_key: authentication.amazon_key,
        amazon_role: authentication.amazon_role,
        sso_enabled: authentication.sso_enabled,
        provider_type: authentication.provider_type ? authentication.provider_type : 'none',
        local_login_disabled: authentication.local_login_disabled,
        httpd_role: authentication.httpd_role,
      };
      //   setIsLoading(false);
      //   setInitialValues(data);
      //   if (authentication.amazon_key) {
      //     setAmazonEdit(true);
      //   }
      setState({
        isLoading: false,
        initialValues: data,
        editMode: false,
      });
      setKey(data.amazon_key);
      miqSparkleOff();
    }).catch(
      ({ error: { message } = { message: __('Could not fetch the data') } }) => {
        add_flash(message, 'error');
        miqSparkleOff();
      },
    );
  }, []);

  const onSubmit = (values) => {
    const patchData = {
      authentication: {
        mode: values.mode,
      },
      session: {
        timeout: values.session_timeout_hours * 3600 + values.session_timeout_mins * 60,
      },
    };
    if (values.mode === 'amazon') {
      patchData.authentication.amazon_key = values.amazon_key;
      console.log(values);
      patchData.authentication.amazon_secret = values.amazon_secret;
      patchData.authentication.amazon_role = values.amazon_role;

      miqAjaxButton('settings_update_amazon_verify', { authentication: patchData.authentication });
    } else if (values.mode === 'httpd') {
      patchData.authentication.sso_enabled = values.sso_enabled;
      patchData.authentication.provider_type = values.provider_type;
      patchData.authentication.local_login_disabled = values.local_login_disabled;
      patchData.authentication.httpd_role = values.httpd_role;
    }

    if (values.mode === 'database' || values.mode === 'httpd') {
      API.patch(`/api/servers/${id}/settings`, patchData).then(() => {
        const message = sprintf(__('Authentication settings saved for %s Server "%s [%s]" in Zone "%s"'), product, name, id, zone);
        add_flash(message, 'success');
        // setInitialValues(values);
        setState((state) => (
          {
            ...state,
            initialValues: values,
          }));
        miqSparkleOff();
      }).catch(
        ({ error: { message } = { message: __('Unknown error') } }) => {
          add_flash(message, 'error');
          miqSparkleOff();
        }
      );
    }
  };

  const componentMapper = {
    ...mapper,
    'validate-provider-credentials': ValidateProviderCredentials,
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return (
    <MiqFormRenderer
      componentMapper={componentMapper}
      initialValues={initialValues}
      className="authentication-form"
      schema={createSchema(!!initialValues.amazon_key, editMode, setState, key, setKey)}
      onSubmit={onSubmit}
      buttonsLabels={{
        submitLabel: __('Save'),
      }}
      canReset
    />
  );
};

AuthenticationForm.propTypes = {
  server: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
  }).isRequired,
  product: PropTypes.string.isRequired,
  zone: PropTypes.string.isRequired,
};

export default AuthenticationForm;
