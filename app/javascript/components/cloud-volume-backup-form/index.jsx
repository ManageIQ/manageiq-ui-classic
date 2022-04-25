import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { restoreData, cloudVolumeBackupOptions } from './helper';

const CloudVolumeBackupForm = ({ recordId, name, type }) => {
  const [{ options, isLoading }, setState] = useState({
    isLoading: true,
  });

  useEffect(() => {
    API.get('/api/cloud_volumes?expand=resources&attributes=name,id')
      .then(({ resources }) => setState({ options: cloudVolumeBackupOptions(resources), isLoading: false }))
      .catch(() => {
        miqRedirectBack('No Cloud volumes found', 'warning', '/cloud_volume_backup/show_list/');
      });
  }, [recordId]);

  const data = options ? restoreData(recordId, name, options) : undefined;

  /** On cancel click event handler */
  const onCancel = () => {
    const { message, url } = data.cancel;
    miqRedirectBack(message, 'success', url);
  };

  /** On submit click event handler */
  const onSubmit = (values) => {
    const selectedOption = options.find((item) => item.value === values.volume_id);
    const payload = {
      volume: { id: selectedOption.value, name: selectedOption.label },
      button: 'restore',
      id: recordId,
      name: '',
    };
    miqSparkleOn();
    http.post('/cloud_volume_backup/backup_restore', payload, { skipErrors: true })
      .then((result) => {
        miqRedirectBack(result.messages, result.status ? 'success' : 'error', '/cloud_volume_backup/show_list');
      })
      .catch((error) => {
        miqRedirectBack(error, 'error', '/cloud_volume_backup/show_list/');
      });
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={data.schema}
      onSubmit={onSubmit}
      onCancel={onCancel}
      canReset
      buttonsLabels={{
        submitLabel: __('Save'),
      }}
    />
  );
};

CloudVolumeBackupForm.propTypes = {
  recordId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default CloudVolumeBackupForm;
