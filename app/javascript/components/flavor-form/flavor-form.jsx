import React, { Component } from 'react';
import { Grid } from 'patternfly-react';
import { sprintf } from 'sprintf-js';
import addSchema from './flavor-form.schema';
import MiqFormRenderer from '../../forms/data-driven-form';
import { http, API } from '../../http_api';
import { cleanVirtualDom } from '../../miq-component/helpers';
import miqRedirectBack from '../../helpers/miq-redirect-back';

class FlavorForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialValues: { is_public: true, rxtx_factor: '1.0' },
      schema: addSchema(),
    };
    cleanVirtualDom();
  }

  componentDidMount() {
    miqSparkleOn();
    Promise.all([http.get('/flavor/ems_list'), http.get('/flavor/cloud_tenants')])
      .then(([{ ems_list }, { cloud_tenants }]) => this.setState(prevState => ({
        initialValues: { ...prevState.initialValues, ems_id: ems_list[0].id },
        schema: addSchema(ems_list, cloud_tenants),
        emsList: ems_list,
        cloudTenants: cloud_tenants.map(item => ({ label: item.name, value: item.id })),
      })), miqSparkleOff());
  }

  submitValues = (values) => {
    miqSparkleOn();
    const data = {
      ...values,
      ems: this.state.emsList.find(({ id }) => id === values.ems_id),
      ems_id: '',
    };
    return API.post(`/api/providers/${values.ems_id}/flavors`, data)
      .then(response => this.getBack(response, values.name))
      .catch(err => console.log('err: ', err));
  };

  getBack = (response, flavorName) => {
    let err = false;
    if (Object.prototype.hasOwnProperty.call(response, 'results')) {
      err = !response.results[0].success;
    }

    if (err) {
      this.onError(response, flavorName);
    } else {
      this.nonError(flavorName);
    }
  }

  onError = (response, flavorName) => {
    const url = '/flavor/show_list';
    const message = `${__('Unable to add Flavor ')}${flavorName} . ${response.results[0].message}`;
    miqRedirectBack(message, 'error', url);
    miqSparkleOff();
  }

  nonError = (flavorName) => {
    const url = '/flavor/show_list';
    const message = sprintf(__('Add of Flavor "%s" was successfully initialized.'), flavorName);
    miqRedirectBack(message, 'success', url);
  }

  cancelClicked = () => {
    miqSparkleOn();
    const message = __('Add of Flavor cancelled by user.');
    const url = '/flavor/show_list';
    miqRedirectBack(message, 'warn', url);
  }

  render() {
    return (
      <Grid fluid>
        <MiqFormRenderer
          initialValues={this.state.initialValues}
          schema={this.state.schema}
          onSubmit={this.submitValues}
          onCancel={this.cancelClicked}
          buttonsLabels={{
            submitLabel: __('Add'),
          }}
        />
      </Grid>
    );
  }
}

export default FlavorForm;
