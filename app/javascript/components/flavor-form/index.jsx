import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Grid, Column } from '@carbon/react';
import MiqFormRenderer from '@@ddf';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './flavor-form.schema';

const FlavorForm = ({ redirect }) => {
  const [{ emsId }, setState] = useState({});

  const onSubmit = ({ emsId, ...values }) => {
    miqSparkleOn();
    API.post(`/api/providers/${emsId}/flavors`, values).then(() => {
      miqRedirectBack(sprintf(__('Add of Flavor "%s" was successfully queued.'), values.name), 'success', redirect);
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    miqRedirectBack(__('Add of Flavor cancelled by user.'), 'warning', redirect);
  };

  return (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <MiqFormRenderer
          schema={createSchema(emsId, setState)}
          onSubmit={onSubmit}
          onCancel={onCancel}
          buttonsLabels={{
            submitLabel: __('Add'),
          }}
        />
      </Column>
    </Grid>
  );
};

FlavorForm.propTypes = {
  redirect: PropTypes.string.isRequired,
};

export default FlavorForm;
