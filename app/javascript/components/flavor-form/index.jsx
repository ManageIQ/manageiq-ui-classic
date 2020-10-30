import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';

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
    <Grid fluid>
      <MiqFormRenderer
        schema={createSchema(emsId, setState)}
        onSubmit={onSubmit}
        onCancel={onCancel}
        buttonsLabels={{
          submitLabel: __('Add'),
        }}
      />
    </Grid>
  );
};

FlavorForm.propTypes = {
  redirect: PropTypes.string.isRequired,
};

export default FlavorForm;
