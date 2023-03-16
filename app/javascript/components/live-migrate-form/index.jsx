import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import { createSchema } from './live-migrate-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { setInitialData, restructureSubmitData } from './helper';

const LiveMigrateForm = ({ recordId }) => {
  const [data, setData] = useState({
    initialValues: { auto_select_host: true },
    isLoading: true,
    disableSelection: true,
    options: {
      hosts: [],
    },
  });

  useEffect(() => {
    setInitialData(recordId, data, setData);
  }, [recordId]);

  const onSubmit = (formData) => {
    const values = {
      ...formData,
      ...restructureSubmitData(formData),
    };
    miqSparkleOn();
    // TODO: Replace this with API urls
    const URL = `/vm_cloud/live_migrate_vm/${recordId}?button=submit`;
    miqAjaxButton(URL, values);
  };

  const onCancel = () => {
    miqSparkleOn();
    const returnURL = '/vm_cloud/explorer/';
    const message = sprintf(__('Live migration of Instances was cancelled by the user'));
    miqRedirectBack(message, 'success', returnURL);
  };

  if (data.isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return !data.isLoading && (
    <MiqFormRenderer
      schema={createSchema(data)}
      initialValues={data.initialValues}
      className="live_migrate_form"
      canReset={false}
      onSubmit={onSubmit}
      onCancel={() => onCancel(data)}
      buttonsLabels={{
        submitLabel: __('Submit'),
      }}
    />
  );
};

LiveMigrateForm.propTypes = {
  recordId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default LiveMigrateForm;
