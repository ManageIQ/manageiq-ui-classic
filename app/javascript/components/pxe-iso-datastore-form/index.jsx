import React from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './pxe-iso-datastore-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const PxeIsoDatastoreForm = ({ emses }) => {
  const submitLabel = __('Add');

  const onSubmit = (values) => {
    const name = values.ems_id.split(' ')[1];
    // eslint-disable-next-line prefer-destructuring
    values.ems_id = values.ems_id.split(' ')[0];

    miqSparkleOn();
    const request = API.post('/api/iso_datastores', values);
    request.then(() => {
      const message = sprintf(__('ISO Datastore "%s" was added.'), name);
      miqRedirectBack(message, 'success', '/pxe/explorer');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(__('Add of new ISO Datastore was cancelled by the user'));
    miqRedirectBack(message, 'warning', '/pxe/explorer');
  };

  return (
    <MiqFormRenderer
      schema={createSchema(emses)}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
    />
  );
};

PxeIsoDatastoreForm.propTypes = {
  emses: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number, name: PropTypes.string })),
};
PxeIsoDatastoreForm.defaultProps = {
  emses: undefined,
};

export default PxeIsoDatastoreForm;
