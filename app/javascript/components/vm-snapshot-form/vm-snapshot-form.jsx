import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';

import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './vm-snapshot-form.schema';

const VmSnapshotForm = ({
  createURL, cancelURL, hideName, descriptionRequired, showMemory,
}) => {
  return (
    <Grid fluid>
      <MiqFormRenderer
        schema={createSchema(hideName, showMemory, descriptionRequired)}
        onSubmit={values => window.miqAjaxButton(createURL, values)}
        onCancel={() => window.miqAjaxButton(cancelURL)}
        buttonsLabels={{
          submitLabel: __('Create'),
        }}
      />
    </Grid>
  );
};

VmSnapshotForm.propTypes = {
  hideName: PropTypes.bool.isRequired,
  descriptionRequired: PropTypes.bool.isRequired,
  showMemory: PropTypes.bool.isRequired,
  createURL: PropTypes.string.isRequired,
  cancelURL: PropTypes.string.isRequired,
};

export default VmSnapshotForm;
