import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import createSchema from './dashboard-form.schema';
// import MiqFormRenderer from '../../forms/data-driven-form';

class DashboardForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      schema: createSchema(this.props.maxDescLen, this.props.maxNameLen, this.props.readOnly)
    };
  }

  render() {
    const { dbAction, dashboardId, initialValues } = this.props;
    const submitLabel = dbAction === 'db_edit' ? __('Save') : __('Copy');
    const submitUrl = `/report/db_edit/${dashboardId}?button=save`;
    const cancelUrl = `/report/db_edit/${dashboardId}?button=cancel`;

    return (
      <Grid fluid>
        Test!
        {/*<MiqFormRenderer*/}
        {/*  initialValues={ initialValues }*/}
        {/*  onSubmit={ values => miqAjaxButton(submitUrl, values) }*/}
        {/*  onCancel={ () => miqAjaxButton(cancelUrl) }*/}
        {/*  onReset={ () => add_flash(__('All changes have been reset'), 'warn') }*/}
        {/*  canReset*/}
        {/*  schema={ this.state.schema }*/}
        {/*  buttonLabels={{*/}
        {/*    submitLabel: submitLabel,*/}
        {/*    resetLabel: __('Reset'),*/}
        {/*    cancelLabel: __('Cancel')*/}
        {/*  }}*/}
        {/*/>*/}
      </Grid>
    );
  }
}

DashboardForm.propTypes = {
  dashboardId: PropTypes.number.isRequired,
  dbAction: PropTypes.string.required,
  initialValues: PropTypes.obj.required,
  maxDescLen: PropTypes.number.isRequired,
  maxNameLen: PropTypes.number.isRequired,
  readOnly: PropTypes.bool.isRequired
};

export default DashboardForm;
