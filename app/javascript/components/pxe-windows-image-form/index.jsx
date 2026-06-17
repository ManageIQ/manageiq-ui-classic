import { useState } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import createSchema from './pxe-windows-image-form.schema';
import { http } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const PxeWindowsImageEditForm = ({
  recordId, imgType, pxeImageTypes,
}) => {
  const [initialValues] = useState({
    img_type: imgType,
  });

  if (!pxeImageTypes || !Array.isArray(pxeImageTypes)) {
    return null;
  }

  const onSubmit = (values) => {
    miqSparkleOn();

    const data = {
      id: recordId,
      image_typ: values.img_type || '',
    };

    http.post(`/pxe/pxe_wimg_edit/${recordId}?button=save`, data, { skipErrors: true })
      .then((response) => {
        const { message } = response;
        miqRedirectBack(message, 'success', '/pxe/explorer');
      })
      .catch((error) => {
        miqRedirectBack(error.data.error, 'error', '/pxe/explorer');
      });
  };

  const onCancel = () => {
    const message = __('Edit of Windows Image was cancelled by the user');
    miqRedirectBack(message, 'warning', '/pxe/explorer');
  };

  return (
    <MiqFormRenderer
      schema={createSchema(pxeImageTypes)}
      initialValues={initialValues}
      canReset
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};

PxeWindowsImageEditForm.propTypes = {
  recordId: PropTypes.string.isRequired,
  imgType: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pxeImageTypes: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  ).isRequired,
};

PxeWindowsImageEditForm.defaultProps = {
  imgType: null,
};

export default PxeWindowsImageEditForm;
