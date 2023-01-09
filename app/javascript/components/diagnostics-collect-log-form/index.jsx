import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './schema';
import { http } from '../../http_api';

const DiagnosticsCollectLogForm = ({ initialData }) => {
  const url = `/ops/log_depot_edit/${initialData.recordId}}`;
  // option item like <No Depot> does not contain a value which is not required to passed into API.
  const BLANK = 'BLANK_VALUE';
  const newPageData = {
    depot_name: '',
    uri: '',
    uri_prefix: '',
    log_protocol: '',
    log_userid: '',
    log_password: '',
  };
  const [data, setData] = useState({ isLoading: initialData.recordId !== 'new', pageData: newPageData });
  const options = Object.entries(initialData.options).map((item) => ({ label: item[1], value: item[0] || BLANK }));

  useEffect(() => {
    if (initialData.recordId !== 'new') {
      http.get(`/${initialData.controller}/log_collection_form_fields/${initialData.recordId}`)
        .then((response) => {
          let responseData = { ...response };
          if (response.log_userid !== '') {
            responseData = { ...responseData, log_password: '●●●●●●●●' };
          }
          setData({
            isLoading: false,
            pageData: responseData,
          });
        });
    }
  }, [initialData.recordId]);

  const onSubmit = (values) => {
    const changedValues = { ...values, uri_prefix: initialData.prefixes[values.log_protocol] || null };
    const formData = { ...data.pageData, ...changedValues };
    // removes the null value attributes from the formData
    Object.keys(formData).forEach((key) => (formData[key] == null || formData[key] === BLANK) && delete formData[key]);
    miqAjaxButton(`${url}?button=save`, formData);
  };

  const onCancel = () => miqAjaxButton(`${url}?button=cancel`);

  return !data.isLoading && (
    <MiqFormRenderer
      schema={createSchema(initialData, options)}
      initialValues={data.pageData}
      canReset={!!initialData.recordId}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};

DiagnosticsCollectLogForm.propTypes = {
  initialData: PropTypes.shape({
    controller: PropTypes.string.isRequired,
    recordId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    options: PropTypes.shape({}),
    prefixes: PropTypes.shape({}),
    logType: PropTypes.string.isRequired || undefined,
    displayName: PropTypes.string.isRequired,
  }).isRequired,
};

export default DiagnosticsCollectLogForm;
