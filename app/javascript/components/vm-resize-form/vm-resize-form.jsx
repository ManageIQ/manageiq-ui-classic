import React, { useState, useEffect, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'carbon-components-react';
import MiqFormRenderer from '@@ddf';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './vm-resize.schema';

const VmResizeForm =({recordId}) =>{
  const [{ isLoading, fields }, setState] = useState({ isLoading: true, fields: [] });

  useEffect(() => {
    if(isLoading){
        API.options(`/api/vms/${recordId}?option_action=resize`)
        .then(loadSchema());
    }
  });

  const loadSchema = (appendState = {}) => ({ data: { form_schema: { fields } } }) => {
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
      isLoading: false,
    }));
  };

  const onSubmit = (values) => {
    miqSparkleOn();
    const resource = {
      resizeValues: values,
    };
    const payload = {
      action: 'resize',
      resource,
    };
    const request = API.post(`/api/vms/${recordId}`, payload);

    request.then(() => {
      const message = sprintf(
        __('Resize of VM has been successfully queued.'));

      miqRedirectBack(message, 'success', '/vm_cloud/explorer');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      'Resize of VM was cancelled by the user'
    );
    miqRedirectBack(message, 'warning', '/vm_cloud/explorer');

  };
    return !isLoading && (
        <Grid>
        <MiqFormRenderer
            schema={createSchema(fields)}
            onSubmit={onSubmit}
            onCancel={onCancel}
        />
        </Grid>
    );

}

// VmResizeForm.propTypes = {
//   recordId: PropTypes.string,
// };

// VmResizeForm.defaultProps = {
//   recordId: undefined,
// }

export default VmResizeForm;
