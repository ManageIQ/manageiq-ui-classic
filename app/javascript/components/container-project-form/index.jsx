import React, { useState } from 'react';
import { Grid } from 'carbon-components-react';
import MiqFormRenderer from '@@ddf';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './container-project-form.schema';

const ContainerProjectForm = () => {
  const [{ emsId }, setState] = useState({ emsId: null });

  const onSubmit = (values) => {
    miqSparkleOn();
    const request = API.post('/api/container_projects', values);
    request.then(() => {
      const message = sprintf(__('Add of Container Project "%s" has been successfully queued.'), values.name);
      miqRedirectBack(message, 'success', '/container_project/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = __('Creation of new Container Project was canceled by the user.');
    miqRedirectBack(message, 'warning', '/container_project/show_list');
  };

  return (
    <Grid>
      <MiqFormRenderer
        initialValues={{}}
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

export default ContainerProjectForm;
