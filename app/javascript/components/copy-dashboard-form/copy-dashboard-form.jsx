import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './copy-dashboard-form.schema';
import { http, API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';

class CopyDashboardForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: true,
    };
  }

  componentDidMount() {
    const { dashboardId } = this.props;
    miqSparkleOn();
    Promise.all([API.get('/api/groups?expand=resources'),
      http.get(`/report/dashboard_get/${this.props.dashboardId}`)])
      .then(([{ resources }, { name, description }]) => {
        const options = resources.map(({ href, description }) => ({ key: href, label: description }));
        this.setState(() => ({
        initialValues: { dashboard_id: dashboardId },
        schema: createSchema(dashboardId, options),
        name: name === null ? undefined : name,
        description: description === null ? undefined : description,
        dashboardId: 1,
        miqGroups: options,
        isLoading: false,
        }), miqSparkleOff);
      })
      .catch(({ error: { message } = { message: __('Could not fetch the data') } }) => add_flash(message, 'error'), miqSparkleOff);
  }

  handleError = (error) => {
    const { data: { error: { message } } } = error;
    return message.includes('Name has already been taken') ? __('Name has already been taken') : message;
  };

  submitValues = (values, dashboardId) => {
    miqSparkleOn();
    const data = {
      ...values,
      dashboard_id: dashboardId,
    };
    return http.post(`/report/db_copy/${values.dashboard_id}?button=save`, data)
      .then(response => this.getBack(response, values.name))
      .catch(err => console.log('err: ', err));
  };

  cancelClicked = () => {
    miqSparkleOn();
    const message = __('Copy of Dashboard cancelled by user.');
    const url = '/report/explorer';
    miqRedirectBack(message, 'success', url);
  };

  render() {
    const { isLoaded, initialValues, schema } = this.state;
    if (!isLoaded) return null;

    return (
      <Grid fluid>
        <MiqFormRenderer
          initialValues={initialValues}
          schema={schema}
          onSubmit={this.submitValues}
          onCancel={this.cancelClicked}
          onReset={() => add_flash(__('All changes have been reset'), 'warn')}
          canReset={true}
          buttonsLabels={{
            submitLabel: __('Save'),
          }}
        />
      </Grid>
    );
  }
}

CopyDashboardForm.propTypes = {
  dashboardId: PropTypes.string,
};

export default CopyDashboardForm;
