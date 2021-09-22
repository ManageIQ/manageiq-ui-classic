import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'carbon-components-react';
import miqRedirectBack from '../../helpers/miq-redirect-back';

import MiqFormRenderer from '../../forms/data-driven-form';

const VmSnapshotForm = ({ url, redirect }) => {
  const [{ isLoading, schema }, setState] = useState({ isLoading: true });

  useEffect(() => {
    API.options(url).then(({ data: { snapshot_form_schema: schema } }) => setState({ isLoading: false, schema }));
  }, [url]);

  const onSubmit = (values) => {
    miqSparkleOn();
    API.post(url, values).then(() => {
      miqRedirectBack(_('Create Snapshot for VM or Instance was started'), 'success', redirect);
    }).catch(miqSparkleOff);
  };

  return !isLoading && (
    <Grid>
      <MiqFormRenderer
        schema={schema}
        onSubmit={onSubmit}
        onCancel={() => miqRedirectBack(_('Snapshot of VM or Instance was cancelled by the user'), 'warning', redirect)}
        buttonsLabels={{
          submitLabel: __('Create'),
        }}
      />
    </Grid>
  );
};

VmSnapshotForm.propTypes = {
  url: PropTypes.string.isRequired,
  redirect: PropTypes.string.isRequired,
};

export default VmSnapshotForm;
