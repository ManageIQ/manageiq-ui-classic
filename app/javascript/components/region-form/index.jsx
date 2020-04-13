import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import createSchema from './region-form.schema';
import MiqFormRenderer from '../../forms/data-driven-form';
import { API } from '../../http_api';
import miqRedirectBack from "../../helpers/miq-redirect-back";

const RegionForm = ({ id, maxDescLen }) => {
  const [description, setDescription] = useState();

  useEffect(() => {
    miqSparkleOn();
    API.get(`/api/regions/${id}?attributes=description`)
      .then(({ description }) => setDescription(description))
      .then(miqSparkleOff);
  }, [id]);

  const onCancel = () => {
    miqSparkleOn();
    const message = __('Edit of Region was cancelled by the user');
    miqRedirectBack(message, 'success', `/ops/explorer/?button=cancel`);
  };

  const onSubmit = (values) => {
    miqSparkleOn();
    const message = __('Region was saved');
    const submitUrl = `/ops/explorer/${id}?button=save`;

    API.post(`/api/regions/${id}`, {
      action: 'edit',
      resource: {
        description: values.description,
      }
    })
      .then(() => miqRedirectBack(message, 'success', submitUrl))
      .catch(miqSparkleOff);
  };

  if (!description) {
    return null;
  }

  return (
    <Grid fluid style={{ paddingTop: 20 }}>
      <MiqFormRenderer
        initialValues={{description}}
        schema={createSchema(maxDescLen)}
        onSubmit={onSubmit}
        onCancel={onCancel}
        onReset={() => add_flash(__('All changes have been reset'), 'warn')}
        canReset
        buttonsLabels={{
          submitLabel: __('Save'),
          resetLabel: __('Reset'),
          cancelLabel: __('Cancel'),
        }}
      />
    </Grid>
  );
}

RegionForm.propTypes = {
  maxDescLen: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
};

export default RegionForm;
