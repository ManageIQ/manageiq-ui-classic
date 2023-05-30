import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import { createSchema } from './evacuate-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { setInitialData } from './helper';

const EvacuateForm = ({ recordId }) => {
  const [data, setData] = useState({
    initialValues: { auto_select_host: true, on_shared_storage: true },
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
    miqSparkleOn();
    // TODO: Replace this with API urls
    const URL = `/vm_cloud/evacuate_vm/${recordId}?button=submit`;
    miqAjaxButton(URL, formData);
  };

  const onCancel = () => {
    miqSparkleOn();
    const returnURL = '/vm_cloud/explorer/';
    const message = sprintf(__('Evacuation of Instances was cancelled by the user'));
    miqRedirectBack(message, 'success', returnURL);
  };

  if (data.isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return !data.isLoading && (
    <MiqFormRenderer
      schema={createSchema(data)}
      initialValues={data.initialValues}
      canReset={false}
      className="evacuate_form"
      onSubmit={onSubmit}
      onCancel={() => onCancel(data)}
      disableSubmit={['invalid']}
      buttonsLabels={{
        submitLabel: __('Submit'),
      }}
    />
  );
};

EvacuateForm.propTypes = {
  recordId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default EvacuateForm;
