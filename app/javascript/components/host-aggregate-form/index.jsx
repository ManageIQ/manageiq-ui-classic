import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './host-aggregate-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const HostAggregateForm = ({ recordId }) => {
  const [{ initialValues, isLoading, emsId }, setState] = useState({ isLoading: !!recordId });

  useEffect(() => {
    if (recordId) {
      API.get(`/api/host_aggregates/${recordId}`).then((initialValues) => {
        setState((state) => ({ ...state, initialValues, isLoading: false }));
      });
    }
  }, [recordId]);

  const onSubmit = (values) => {
    miqSparkleOn();
    const request = recordId ? API.patch(`/api/host_aggregates/${recordId}`, values) : API.post('/api/host_aggregates', values);

    request.then(() => {
      const message = sprintf(recordId
        ? __('Modification of Host Aggregate %s has been successfully queued')
        : __('Add of Host Aggregate "%s" has been successfully queued.'),
      values.name);

      miqRedirectBack(message, 'success', '/host_aggregate/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Host Aggregate "%s" was canceled by the user.')
        : __('Creation of new Host Aggregate was canceled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/host_aggregate/show_list');
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(recordId, emsId, setState)}
      initialValues={initialValues}
      canReset={!!recordId}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel: recordId ? __('Save') : __('Add') }}
    />
  );
};

HostAggregateForm.propTypes = {
  recordId: PropTypes.string,
};
HostAggregateForm.defaultProps = {
  recordId: undefined,
};

export default HostAggregateForm;
