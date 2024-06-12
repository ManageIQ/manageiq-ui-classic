import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import createSchema from './authentication.schema';
import MiqFormRenderer from '../../forms/data-driven-form';
import { API } from '../../http_api';

const AuthenticationForm = ({ server: { id, name } }) => {
  console.log(id);
  console.log(name);
  const [isLoading, setIsLoading] = useState(true);
  const [initialValues, setInitialValues] = useState({});

  useEffect(() => {
    miqSparkleOn();
    API.get(`/api/servers/${id}/settings`)
      // eslint-disable-next-line camelcase
      .then((data) => {
        console.log(data);

        // setInitialValues(parsedValues);

        setIsLoading(false);

        miqSparkleOff();
      })
      .catch(
        ({ error: { message } = { message: __('Could not fetch the data') } }) => {
          add_flash(message, 'error');
          miqSparkleOff();
        },
      );
  }, []);

  const onSubmit = (values) => {
    console.log(values);

    // API.patch(`/api/servers/${id}/settings`, patch)
    //   .then(
    //     () => {
    //       const message = sprintf(__('Configuration settings saved for %s Server "%s [%s]" in Zone "%s"'), product, name, id, zone);
    //       add_flash(message, 'success');
    //       setInitialValues(values);
    //       miqSparkleOff();
    //     },
    //   )
    //   .catch(
    //     ({ error: { message } = { message: __('Unknown error') } }) => {
    //       add_flash(message, 'error');
    //       miqSparkleOff();
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return (
    <MiqFormRenderer
      initialValues={initialValues}
      className="authentication-form"
      schema={createSchema()}
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
};

export default AuthenticationForm;
