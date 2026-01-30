import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Grid, Column } from '@carbon/react';
import MiqFormRenderer from '../../forms/data-driven-form';
import { API } from '../../http_api';
import createSchema from './vm-server-relationship-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const VmServerRelationShipForm = ({ recordId, redirect }) => {
  const [{ isLoading, initialValues }, setState] = useState({ isLoading: true });

  const promise = useMemo(() => API.get('/api/servers?expand=resources&attributes=id,name,vm_id&sort_by=name&sort_order=desc'), [recordId]);

  useEffect(() => {
    promise.then(({ resources }) => {
      const { id } = resources.find(({ vm_id: vmId }) => vmId === recordId) || {};
      setState({ isLoading: false, initialValues: { serverId: id } });
    });
  }, [recordId]);

  const onSubmit = ({ serverId: id }) => {
    miqSparkleOn();

    // The `miq_server` field always needs to be sent, even if the value is not set
    API.post(`/api/vms/${recordId}`, {
      action: 'set_miq_server',
      resource: {
        miq_server: {
          id,
        },
      },
    }).then(() => {
      miqRedirectBack(__('Management Engine Relationship saved'), 'success', redirect);
    }).catch(miqSparkleOff);
  };

  const onCancel = () => miqRedirectBack(__('Edit Management Engine Relationship was cancelled by the user'), 'warning', redirect);

  return !isLoading && (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <MiqFormRenderer
          initialValues={initialValues}
          schema={createSchema(promise)}
          onSubmit={onSubmit}
          onCancel={onCancel}
          canReset
          buttonsLabels={{
            submitLabel: __('Save'),
          }}
        />
      </Column>
    </Grid>
  );
};

VmServerRelationShipForm.propTypes = {
  recordId: PropTypes.string.isRequired,
  redirect: PropTypes.string.isRequired,
};

export default VmServerRelationShipForm;
