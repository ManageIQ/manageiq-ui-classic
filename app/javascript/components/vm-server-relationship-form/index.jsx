import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import { API } from '../../http_api';
import { cleanVirtualDom } from '../../miq-component/helpers';
import createSchema from './vm-server-relationship-form.schema';

class VmServerRelationShipForm extends Component {
  state = {
    initialValues: {
      server_id: null,
    },
    schema: createSchema([]),
    isLoading: true,
  }

  componentDidMount() {
    cleanVirtualDom();
    const { vmId, serverId } = this.props;
    Promise.all([API.get('/api/servers?expand=resources'), API.get(`/api/vms/${vmId}`)]).then(console.log);
    Promise.all([API.get('/api/servers?expand=resources'), API.get(`/api/vms/${vmId}`)])
      .then(([{ resources }]) => {
        const assignedServer = resources.find(({ id }) => id === serverId);
        const serverHref = assignedServer ? assignedServer.href : undefined;
        this.setState({
          isLoading: false,
          schema: createSchema(
            resources.map(({ href, name, id }) => ({ value: href, label: `${name} (${id})` })),
          ),
          initialValues: {
            server_id: serverHref,
          },
        });
      })
      .then(() => this.setState({ isLoading: false }));
  }


  render() {
    console.log(this.props);
    const { vmId } = this.props;
    const { initialValues, isLoading, schema } = this.state;
    const cancelUrl = `/vm_or_template/evm_relationship_update/${vmId}?button=cancel`;

    if (isLoading) { return null; }

    return (
      <Grid fluid>
        <MiqFormRenderer
          initialValues={initialValues}
          schema={schema}
          onSubmit={console.log}
          onReset={() => add_flash(__('All changes have been reset'), 'warn')}
          onCancel={() => miqAjaxButton(cancelUrl)}
          canReset
          buttonsLabels={{
            submitLabel: __('Save'),
          }}
        />
      </Grid>
    );
  }
}

VmServerRelationShipForm.propTypes = {
  vmId: PropTypes.string.isRequired,
  serverId: PropTypes.string,
};

VmServerRelationShipForm.defaultProps = {
  serverId: undefined,
};

export default VmServerRelationShipForm;
