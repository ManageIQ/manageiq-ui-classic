import React, { useState, useEffect} from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './cloud-volume-snapshot-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const CloudVolumeSnapshot = ({
  recordId, createURL,
}) => {
  const [{ initialValues, isLoading }, setState] = useState({
    // isLoading: !!recordId,
    // isLoading: recordId,
  });

  // const submitLabel = !!recordId ? __('Save') : __('Add');
  console.log("record id is:" + recordId);

  /*
  const onSubmit = (values) => {
    miqSparkleOn();

    // const request = recordId ? API.patch(`/api/actions/${recordId}`, values) : API.post('/api/actions', values);
    const request = API.post(`/api/cloud_volumes/${recordId}/snapshots`, values);
    request.then(() => {
      const message = sprintf(
        __('New Snapshot "%s" has been successfully queued.'),
        values.name,
      );
      miqRedirectBack(message, 'success', '/cloud_volume/show_list');
    }).catch(miqSparkleOff);
  };
*/
  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Snapshot"%s" was canceled by the user.')
        : __('Creation of new Snapshot was canceled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/cloud_volume/show_list');
  };

  useEffect(() => {
  }, []);
  /*

  useEffect(() => {
    
    if (recordId) {
      API.get(`/api/actions/${recordId}`).then((initialValues) => {
        setState({ initialValues, isLoading: false });
      });
    }
    
  }, [recordId]);
  
*/
  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(!!recordId)}
      initialValues={initialValues}
      // canReset={!!recordId}
      // onSubmit={onSubmit}
      onSubmit={(values) => window.miqAjaxButton(createURL, values)}
      onCancel={onCancel}
      // buttonsLabels={{ submitLabel }}
      canReset
      buttonsLabels={{
        submitLabel: __('Save'),
      }}
    />
  );
};

CloudVolumeSnapshot.propTypes = {
  recordId: PropTypes.string,
  createURL: PropTypes.string.isRequired,
};

CloudVolumeSnapshot.defaultProps = {
  recordId: undefined,
};

export default CloudVolumeSnapshot;