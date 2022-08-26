import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './vm-evacuate-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { Loading } from 'carbon-components-react';

const VmEvacuateForm = ({ recordIds }) => {
  console.log(recordIds)

  const [{
    initialValues, isLoading,
  }, setState] = useState({
    isLoading: true,
  });

  useEffect(() => {
    if (isLoading && recordIds.length == 1) {

      // recordIds is the same as ==> @evacuate_items = find_records_with_rbac(VmOrTemplate, session[:evacuate_items]).sort_by(&:name)
      API.get(`/api/vms/${recordIds[0].id}`).then(({ resources }) => { // this is returning undefined // '/api/vms/2955'
        // might not need this call anyways? it
        console.log(resources)

        // depeding on what we get we change the default values
        const defaultInitialValues = {
          auto_select_host: true,
          destination_host: [], // null,
          on_shared_storage: true,
          admin_password: '', // null,
        };
        setState({
          initialValues: defaultInitialValues,
          parentOptions: [],
          isLoading: false,
        });
      })
    } else if (isLoading) {
      const defaultInitialValues = {
        auto_select_host: true,
        destination_host: [], // null,
        on_shared_storage: true,
        admin_password: '', // null,
      };
      setState({
        initialValues: defaultInitialValues,
        parentOptions: [],
        isLoading: false,
      });
    }
  });

  const onSubmit = (values) => {
    // TODO: complete submit logic
    // reference evacuate_handle_submit_button (for here and API side) from app/controllers/mixins/actions/vm_actions/evacuate.rb
    miqSparkleOn();
    const resource = {

    };
    const payload = {
      action: 'test',
      resource,
    };
    const request = API.post(`/api/vms/${recordIds}`, payload);

    request.then(() => {
      const test = 'mels';
      const message = sprintf(
        recordIds.length > 1
          ? __('Queued evacuation of the Instances.')
          : __(`Queued evacuation of Instance ${test}`),
      );
      miqRedirectBack(message, 'success', '/vm_cloud/explorer');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordIds.length > 1
        ? __('Evacuation of Instances was cancelled by the user.')
        : __('Evacuation of Instance was cancelled by the user.'),
    );
    miqRedirectBack(message, 'warning', '/vm_cloud/explorer');
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema()}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};

VmEvacuateForm.propTypes = {
  recordIds: PropTypes.arrayOf(PropTypes.any),
};

VmEvacuateForm.defaultProps = {
  recordIds: [],
};

export default VmEvacuateForm;
