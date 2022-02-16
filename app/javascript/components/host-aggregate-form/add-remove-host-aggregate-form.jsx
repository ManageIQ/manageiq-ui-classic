import React from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './add-remove-host-aggregate-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const AddRemoveHostAggregateForm = ({ recordId, hostChoices, isAdd }) => {
  const hostOptions = [];
  hostChoices.forEach((host) => {
    hostOptions.push({ label: host[0], value: host[1].toString() });
  });

  const onSubmit = (values) => {
    miqSparkleOn();
    const resource = {
      host_id: values.host_id,
    };
    const payload = {
      action: isAdd ? 'add_host' : 'remove_host',
      resource,
    };
    const request = API.post(`/api/host_aggregates/${recordId}`, payload);

    request.then(() => {
      const message = sprintf(isAdd
        ? __('Addition of Host has been successfully queued.')
        : __('Removal of Host has been successfully queued.'));

      miqRedirectBack(message, 'success', '/host_aggregate/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    miqSparkleOn();
    const message = sprintf(isAdd
      ? __('Addition of Host was cancelled by the user.')
      : __('Removal of Host was cancelled by the user.'));

    miqRedirectBack(message, 'warning', '/host_aggregate/show_list');
  };

  return (
    <MiqFormRenderer
      schema={createSchema(hostOptions, recordId)}
      onSubmit={onSubmit}
      onCancel={onCancel}
      canReset
      buttonsLabels={{ submitLabel: isAdd ? __('Add') : __('Remove') }}
    />
  );
};

AddRemoveHostAggregateForm.propTypes = {
  recordId: PropTypes.string,
  hostChoices: PropTypes.arrayOf(PropTypes.any),
  isAdd: PropTypes.bool,
};
AddRemoveHostAggregateForm.defaultProps = {
  recordId: undefined,
  hostChoices: [],
  isAdd: true,
};

export default AddRemoveHostAggregateForm;
