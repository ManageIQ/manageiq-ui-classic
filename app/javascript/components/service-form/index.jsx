import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import createSchema from './service-form.schema';
import MiqFormRenderer from '../../forms/data-driven-form';
import { http } from '../../http_api';
import { cleanVirtualDom } from '../../miq-component/helpers';

class ServiceForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      schema: createSchema(props.maxNameLen, props.maxDescLen),
    };
  }

  componentDidMount() {
    cleanVirtualDom();
    miqSparkleOn();
    http.get(`/service/service_form_fields/${this.props.serviceFormId}`)
      .then(data => this.setState({ initialValues: { ...data } }, miqSparkleOff()));
  }

  render() {
    const { serviceFormId } = this.props;
    const cancelUrl = `/service/service_edit/${serviceFormId}?button=cancel`;
    const submitUrl = `/service/service_edit/${serviceFormId}?button=save`;
    return (
      <Grid fluid style={{ paddingTop: 20 }}>
        <MiqFormRenderer
          initialValues={this.state.initialValues}
          schema={this.state.schema}
          onSubmit={values => miqAjaxButton(submitUrl, values)}
          onCancel={() => miqAjaxButton(cancelUrl)}
          onReset={() => add_flash(__('All changes have been reset'), 'warn')}
          canReset
          buttonsLabels={{
            submitLabel: __('Save'),
            resetLabel: __('Reset'),
            cancelLabel: __('Cancel'),
          }}
        />
      </Grid>
    );
  }
}

ServiceForm.propTypes = {
  maxNameLen: PropTypes.number.isRequired,
  maxDescLen: PropTypes.number.isRequired,
  serviceFormId: PropTypes.number.isRequired,
};

export default ServiceForm;
