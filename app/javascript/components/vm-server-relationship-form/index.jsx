import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import { API } from '../../http_api';
import createSchema from './vm-server-relationship-form.schema';

class VmServerRelationShipForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  componentDidMount() {
    const { serverId } = this.props;
    API.get('/api/servers?expand=resources&sort_by=name&sort_order=desc')
      .then(({ resources }) => {
        const assignedServer = resources.find(({ id }) => id === serverId);
        const serverHref = assignedServer ? assignedServer.href : undefined;
        this.setState({
          isLoading: false,
          schema: createSchema([
            { label: `<${__('Not a Server')}>` },
            ...resources.map(({ href, name, id }) => ({ value: href, label: `${name} (${id})` })),
          ]),
          initialValues: {
            serverId: serverHref,
          },
        });
      });
  }

  onSubmit = (values) => {
    const { vmId } = this.props;
    const submitUrl = `/vm_or_template/evm_relationship_update/${vmId}?button=save`;
    return API.post(`/api/vms/${vmId}`, {
      action: 'set_miq_server',
      resource: {
        miq_server: { href: values.serverId || undefined },
      },
    })
      .then(() => miqAjaxButton(submitUrl));
  }

  render() {
    const { vmId } = this.props;
    const { initialValues, isLoading, schema } = this.state;
    const cancelUrl = `/vm_or_template/evm_relationship_update/${vmId}?button=cancel`;

    if (isLoading) { return null; }

    return (
      <Grid fluid>
        <MiqFormRenderer
          initialValues={initialValues}
          schema={schema}
          onSubmit={this.onSubmit}
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
