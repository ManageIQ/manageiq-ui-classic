import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'carbon-components-react';
import createSchema from './edit-service-form.schema';
import MiqFormRenderer from '../../forms/data-driven-form';

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
      miqAjaxButton(`/service/service_edit/${recordId}?button=save`);
    }).catch(miqSparkleOff);
  };

  return !isLoading && (
    <Grid style={{ paddingTop: 20 }}>
      <MiqFormRenderer
        initialValues={initialValues}
        schema={createSchema(maxNameLen, maxDescLen)}
        onSubmit={onSubmit}
        onCancel={() => miqAjaxButton(`/service/service_edit/${recordId}?button=cancel`)}
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
