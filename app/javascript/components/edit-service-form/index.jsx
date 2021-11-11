import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'carbon-components-react';
import createSchema from './edit-service-form.schema';
import MiqFormRenderer from '../../forms/data-driven-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const EditServiceForm = ({ maxNameLen, maxDescLen, recordId }) => {
  const [{ isLoading, initialValues }, setState] = useState({ isLoading: true });

  useEffect(() => {
    API.get(`/api/services/${recordId}`).then((initialValues) => {
      setState({ isLoading: false, initialValues });
    });
  }, [recordId]);

  const onSubmit = ({ name, description }) => {
    miqSparkleOn();
    API.patch(`/api/services/${recordId}`, { name, description }).then(() => {
      const message = sprintf(__('Service "%s"  was saved"'), name);
      miqRedirectBack(message, 'warning', '/service/show_list');
    }).catch(miqSparkleOff);

    miqSparkleOn();
  };

  const onCancel = () => {
    miqSparkleOn();
    const message = sprintf(__('Edit of Service "%s" was cancelled by the user'), initialValues && initialValues.name);
    miqRedirectBack(message, 'warning', '/service/show_list');
  };

  return !isLoading && (
    <Grid style={{ paddingTop: 20 }}>
      <MiqFormRenderer
        initialValues={initialValues}
        schema={createSchema(maxNameLen, maxDescLen)}
        onSubmit={onSubmit}
        onCancel={onCancel}
        canReset
        buttonsLabels={{
          submitLabel: __('Save'),
        }}
      />
    </Grid>
  );
};

EditServiceForm.propTypes = {
  maxNameLen: PropTypes.number.isRequired,
  maxDescLen: PropTypes.number.isRequired,
  recordId: PropTypes.number.isRequired,
};

export default EditServiceForm;
