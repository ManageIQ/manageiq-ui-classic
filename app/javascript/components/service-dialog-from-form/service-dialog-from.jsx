import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';

import MiqFormRenderer from '../../forms/data-driven-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { API } from '../../http_api';
import serviceDialogFromOtSchema from './service-dialog-from.schema';

const ServiceDialogFromOt = ({
  templateId, dialogClass, templateClass, miqRedirectBackAdress,
}) => {
  const onSubmit = values => API.post('/api/service_dialogs', {
    action: 'template_service_dialog',
    resource: {
      ...values,
      template_id: templateId,
      dialog_class: dialogClass,
      template_class: templateClass,
    },
  }).then(() => miqRedirectBack(
    sprintf(__('Service Dialog "%s" was successfully created'), values.label),
    'success', miqRedirectBackAdress,
  ));

  return (
    <Grid fluid>
      <MiqFormRenderer
        schema={serviceDialogFromOtSchema}
        onSubmit={onSubmit}
        onCancel={() => miqRedirectBack(__('Creation of a new Service Dialog was cancelled by the user'), 'success', miqRedirectBackAdress)}
        buttonsLabels={{ submitLabel: __('Save') }}
      />
    </Grid>
  );
};

ServiceDialogFromOt.propTypes = {
  templateId: PropTypes.number.isRequired,
  dialogClass: PropTypes.string.isRequired,
  templateClass: PropTypes.string.isRequired,
  miqRedirectBackAdress: PropTypes.string.isRequired,
};

export default ServiceDialogFromOt;
