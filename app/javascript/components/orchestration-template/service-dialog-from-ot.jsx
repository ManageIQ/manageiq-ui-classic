import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';

import MiqFormRenderer from '../../forms/data-driven-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { API } from '../../http_api';
import serviceDialogFromOtSchema from './service-dialog-from-ot.schema';

const ServiceDialogFromOt = ({ otId }) => {
  const onSubmit = values => API.post('/api/service_dialogs', {
    action: 'orchestration_template_service_dialog',
    resource: {
      ...values,
      ot_id: otId,
    },
  }).then(() => miqRedirectBack(
    sprintf(__('Service Dialog "%s" was successfully created'), values.label),
    'success', '/catalog/explorer',
  ));

  return (
    <Grid fluid>
      <MiqFormRenderer
        schema={serviceDialogFromOtSchema}
        onSubmit={onSubmit}
        onCancel={() => miqRedirectBack(__('Creation of a new Service Dialog was cancelled by the user'), 'success', '/catalog/explorer')}
        buttonsLabels={{ submitLabel: __('Save') }}
      />
    </Grid>
  );
};

ServiceDialogFromOt.propTypes = {
  otId: PropTypes.number.isRequired,
};

export default ServiceDialogFromOt;
