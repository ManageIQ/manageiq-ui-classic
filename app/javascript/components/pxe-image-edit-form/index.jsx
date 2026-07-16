import { useState } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import createSchema from './pxe-image-edit-form.schema';
import { http } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const PxeImageEditForm = ({
  recordId, imgType, defaultForWindows, pxeImageTypes,
}) => {
  const [initialValues] = useState({
    img_type: imgType,
    default_for_windows: defaultForWindows || false,
  });

  if (!pxeImageTypes || !Array.isArray(pxeImageTypes)) {
    return null;
  }

  const onSubmit = (values) => {
    miqSparkleOn();

    const data = {
      id: recordId,
      image_typ: values.img_type || '',
      default_for_windows: values.default_for_windows ? '1' : '0',
    };

    http.post(`/pxe/pxe_image_edit/${recordId}?button=save`, data, { skipErrors: true })
      .then((response) => {
        const { message } = response;
        miqRedirectBack(message, 'success', '/pxe/explorer');
      })
      .catch((error) => {
        miqRedirectBack(error.data.error, 'error', '/pxe/explorer');
      });
  };

  const onCancel = () => {
    const message = __('Edit of PXE Image was cancelled by the user');
    miqRedirectBack(message, 'warning', '/pxe/explorer');
  };

  return (
    <div className="pxe-image-form">
      <MiqFormRenderer
        schema={createSchema(pxeImageTypes)}
        initialValues={initialValues}
        canReset
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  );
};

PxeImageEditForm.propTypes = {
  recordId: PropTypes.string.isRequired,
  imgType: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultForWindows: PropTypes.bool,
  pxeImageTypes: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  ).isRequired,
};

PxeImageEditForm.defaultProps = {
  imgType: null,
  defaultForWindows: false,
};

export default PxeImageEditForm;
