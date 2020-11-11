import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import { http } from '../../http_api';
import createSchema from './create-form.schema';


class CloudTenantForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      schema: createSchema(!!props.cloudTenantFormId, props.emsChoices),
    };
  }

  componentDidMount() {
    if (this.props.cloudTenantFormId) {
      miqSparkleOn();
      http.get(`/cloud_tenant/cloud_tenant_form_fields/${this.props.cloudTenantFormId}`)
        .then(data => this.setState({ initialValues: { ...data } }, miqSparkleOff()));
    }
  }


  render() {
    const { cloudTenantFormId } = this.props;
    const cancelUrl = cloudTenantFormId ? `/cloud_tenant/update/${cloudTenantFormId}?button=cancel` : '/cloud_tenant/create/new?button=cancel';
    const submitUrl = cloudTenantFormId ? `/cloud_tenant/update/${cloudTenantFormId}?button=save` : '/cloud_tenant/create/new?button=add';
    return (
      <Grid fluid>
        <h3>{cloudTenantFormId ? __('Edit Cloud Tenant') : __('Basic Information')}</h3>
        <MiqFormRenderer
          initialValues={this.state.initialValues}
          schema={this.state.schema}
          onSubmit={values => miqAjaxButton(submitUrl, values, { complete: false })}
          onCancel={() => miqAjaxButton(cancelUrl)}
          canReset={!!cloudTenantFormId}
          buttonsLabels={{
            submitLabel: cloudTenantFormId ? __('Save') : __('Add'),
          }}
        />
      </Grid>
    );
  }
}

CloudTenantForm.propTypes = {
  cloudTenantFormId: PropTypes.number,
  emsChoices: PropTypes.shape({
    [PropTypes.string]: PropTypes.number,
  }),
};

CloudTenantForm.defaultProps = {
  cloudTenantFormId: undefined,
  emsChoices: undefined,
};

export default CloudTenantForm;
