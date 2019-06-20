import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './copy-dashboard-form.schema';
import { http, API } from '../../http_api';
import handleError from '../../helpers/handle-failure';

const CopyDashboardForm = ({ dashboardId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialValues, setInitialValues] = useState({});
  const [schema, setSchema] = useState({});
  const [options, setOptions] = useState([]);

  const submitValues = (values) => {
    miqSparkleOn();
    const data = {
      ...values,
      dashboard_id: dashboardId,
    };

    return http.post(`/report/db_copy/${dashboardId}?button=save`, data, { skipErrors: [400] })
      .then(({ name }) =>
        miqAjaxButton(
          ('/report/dashboard_render'),
          { original_name: name, name: values.name, group: options.find(option => option.value === values.group_id).label },
        ))
      .catch((e) => {
        handleError(e);
        miqSparkleOff();
      });
  };

  const cancelClicked = () => {
    miqSparkleOn();
    miqAjaxButton(`/report/db_copy/${dashboardId}?button=cancel`);
  };

  useEffect(() => {
    miqSparkleOn();
    Promise.all([API.get('/api/groups?expand=resources'),
      http.get(`/report/dashboard_get/${dashboardId}`)])
      .then(([{ resources }, { name, description, owner_id }]) => {
        const options = resources.map(({ id, description }) => ({ value: id, label: description }));
        setOptions(options);
        setInitialValues({ name, description, group_id: owner_id });
        setSchema(createSchema(options, name, dashboardId));
        setIsLoading(false);
        miqSparkleOff();
      })
      .catch((e) => {
        handleError(e);
        miqSparkleOff();
      });
  }, []);

  if (isLoading) return null;
  return (
    <Grid fluid>
      <MiqFormRenderer
        initialValues={initialValues}
        schema={schema}
        onSubmit={submitValues}
        onCancel={cancelClicked}
        onReset={() => add_flash(__('All changes have been reset'), 'warn')}
        canReset
        buttonsLabels={{
          submitLabel: __('Save'),
        }}
      />
    </Grid>
  );
};

CopyDashboardForm.propTypes = {
  dashboardId: PropTypes.string.isRequired,
};

export default CopyDashboardForm;
