import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'carbon-components-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './cloud-network-form.schema';
import { networkProviders } from '../../helpers/network-providers';
import { API } from '../../http_api';
import handleFailure from '../../helpers/handle-failure';

class CloudNetworkForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      initialValues: {
        enabled: true,
        external_facing: false,
        shared: false,
      },
      ems: [],
    };
  }

  componentDidMount() {
    const { cloudNetworkId } = this.props;
    if (!cloudNetworkId) {
      networkProviders().then((providers) => {
        this.setState({
          ems: [{ name: `<${__('Choose')}>`, id: '-1' }, ...providers],
          isLoading: false,
        });
      }).then(miqSparkleOff);
    } else {
      API.get(`/api/cloud_networks/${cloudNetworkId}?attributes=cloud_tenant.id,cloud_tenant.name,ext_management_system.name`)
        .then((data) => {
          this.setState({
            initialValues: { ...data, cloud_tenant: data.cloud_tenant.id },
            ems: [{ id: data.ems_id, name: data.ext_management_system.name }],
            cloudTenantName: data.cloud_tenant.name,
            isLoading: false,
          });
          API.options(`/api/cloud_networks/${cloudNetworkId}`).then(this.loadSchema());
        })
        .then(miqSparkleOff)
        .catch(handleFailure);
    }
  }

  loadSchema = (appendState = {}) => ({ data: { form_schema: { fields } } }) => {
    this.setState({
      ...appendState,
      fields,
    });
  };

  cancelClicked = () => {
    const { cloudNetworkId } = this.props;
    const url = cloudNetworkId ? `/cloud_network/update/${cloudNetworkId}?button=cancel` : '/cloud_network/create/new?button=cancel';
    miqAjaxButton(url);
  };

  saveClicked = (values) => {
    const { cloudNetworkId } = this.props;
    if (cloudNetworkId) {
      const { cloudTenantName } = this.state;
      const url = `/cloud_network/update/${cloudNetworkId}?button=save`;
      miqAjaxButton(url, { ...values, cloud_tenant: { id: values.cloud_tenant, name: cloudTenantName } }, { complete: false });
    } else {
      const url = 'create/new?button=add';
      miqAjaxButton(url, { ...values, vlan_transparent: false, cloud_tenant: { id: values.cloud_tenant } }, { complete: false });
    }
  };

  emptySchema = (appendState = {}) => {
    const fields = [];
    this.setState({
      ...appendState,
      fields,
    });
  }

  render() {
    const validation = (values) => {
      const errors = {};
      if (values.ems_id === '-1') {
        errors.ems_id = __('Required');
      }
      return errors;
    };

    const {
      initialValues, ems, isLoading,
    } = this.state;
    const { cloudNetworkId } = this.props;

    if (isLoading) {
      return null;
    }

    const { fields } = this.state;

    return (
      <Grid>
        <MiqFormRenderer
          initialValues={initialValues}
          schema={createSchema(ems, cloudNetworkId, this.loadSchema, this.emptySchema, fields)}
          onSubmit={this.saveClicked}
          validate={validation}
          onCancel={this.cancelClicked}
          canReset={!!cloudNetworkId}
          buttonsLabels={{
            submitLabel: cloudNetworkId ? __('Save') : __('Add'),
          }}
        />
      </Grid>
    );
  }
}

CloudNetworkForm.propTypes = {
  cloudNetworkId: PropTypes.string,
};

CloudNetworkForm.defaultProps = {
  cloudNetworkId: undefined,
};

export default CloudNetworkForm;
