import React from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './vm-floating-ips-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const VmFloatingIPsForm = ({ recordId, isAssociate, options }) => {
  const ipOptions = [];
  options.forEach((item) => {
    ipOptions.push({ label: item.address, value: item.id });
  });

  const onSubmit = (values) => {
    miqSparkleOn();
    const resource = {
      floating_ip: values.floating_ip,
    };
    const payload = {
      action: isAssociate ? 'associate' : 'disassociate',
      resource,
    };
    const request = API.post(`/api/vms/${recordId}`, payload);

    request.then(() => {
      const message = sprintf(
        isAssociate
          ? __('Association of Floating IP with Instance was queued up sucessfully.')
          : __('Disassociation of Floating IP with Instance was queued up sucessfully.'),
      );
      miqRedirectBack(message, 'success', '/vm_cloud/explorer');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      isAssociate
        ? __('Association of Floating IP with Instance was cancelled.')
        : __('Disassociation of Floating IP with Instance was cancelled.'),
    );
    miqRedirectBack(message, 'warning', '/vm_cloud/explorer');
  };

  return (
    <MiqFormRenderer
      schema={createSchema(ipOptions)}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};

VmFloatingIPsForm.propTypes = {
  recordId: PropTypes.string,
  isAssociate: PropTypes.bool,
  options: PropTypes.arrayOf(PropTypes.any),
};

VmFloatingIPsForm.defaultProps = {
  recordId: undefined,
  isAssociate: true,
  options: [],
};

export default VmFloatingIPsForm;
