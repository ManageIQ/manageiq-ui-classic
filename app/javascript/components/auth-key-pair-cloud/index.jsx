import React from 'react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './auth-key-pair-cloud-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const AuthKeypairCloudForm = () => {
  const onSubmit = (values) => {
    miqSparkleOn();
    API.post('/api/auth_key_pairs', values).then(() => {
      const message = sprintf(__('Add of Key Pair "%s" has been successfully queued.'), values.name);
      miqRedirectBack(message, 'success', '/auth_key_pair_cloud/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    miqSparkleOn();
    const message = __('Add of new Key Pair was cancelled by the user');
    miqRedirectBack(message, 'warning', '/auth_key_pair_cloud/show_list');
  };

  return (
    <MiqFormRenderer
      schema={createSchema()}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{
        submitLabel: __('Add'),
      }}
    />
  );
};

export default AuthKeypairCloudForm;
