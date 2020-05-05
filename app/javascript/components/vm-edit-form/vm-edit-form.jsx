import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './vm-edit-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import handleFailure from '../../helpers/handle-failure';

class VmEditForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
    };
  }

  componentDidMount() {
    miqSparkleOn();

    const {
      emsId,
      recordId,
      isTemplate, // TODO API request cutoffs, endpoint change
    } = this.props;

    const vmOption = (vm) => ({
      key: vm.id, // dual-list
      label: `${vm.name} -- ${vm.location}`,
      value: vm.id, // select
    });

    const vmPick = ({ id, name, location }) => ({ id, name, location });

    const customAttribute = (custom_attributes, name) => {
      let attr = _.find(custom_attributes, { name: 'custom_1' });
      return attr && attr.serialized_value || null;
    };

    const vmsUnderEms = API.get(`/api/vms/?filter[]=ems_id=${emsId}&expand=resources`)
      .then(({ resources = [] }) => resources.map(vmPick));

    const vmDetail = recordId ? (API.get(`/api/vms/${recordId}?attributes=child_resources,parent_resource,custom_attributes`)
      .then(({ name, description, child_resources = [], parent_resource, custom_attributes = [] }) => ({
        child_vms: child_resources.map(vmPick),
        custom_1: customAttribute(custom_attributes, 'custom_1'),
        description,
        name,
        parent_vm: parent_resource && parent_resource.id,
      }))) : Promise.resolve({
        child_vms: [],
        custom_1: null,
        description: '',
        name: '',
        parent_vm: null,
      });

    Promise.all([vmDetail, vmsUnderEms])
      .then(([record, allVms]) => {
        const childrenIds = _.map(record.child_vms, 'id');

        const parentOptions = allVms
          .filter((vm) => vm.id !== recordId)
          .map(vmOption);

        // child options are everything except record and its children
        // but the whole list is candidates + actual children
        const childOptions = parentOptions;

        this.setState({
          initialValues: record,
          instanceName: record.name,
          isLoaded: true,
          schema: createSchema(parentOptions, childOptions, !isTemplate),
        });

        miqSparkleOff();
      })
      .catch(handleFailure);
  }

  submitValues = (values) => {
    const val = {
      action: 'edit',
      resource: {
        description: values.description,
        custom_1: values.custom_1,
        parent_resource: values.parent_vm ? { href: `/api/vms/${values.parent_vm}` } : null,
        child_resources: values.child_vms.map((vm) => ({ href: `/api/vms/${vm}` })),
      },
    };
    return API.post(`/api/vms/${this.props.recordId}`, val)
      .then(() => {
        miqSparkleOn();
        const message = sprintf(__('%s "%s" was saved'), this.props.displayName, this.state.instanceName);
        // FIXME bad
        miqRedirectBack(message, 'success', '/vm_infra/explorer/');
      })
      .catch(handleFailure);
  }

  cancelClicked = () => {
    miqSparkleOn();
    const message = sprintf(__('Edit of %s "%s" was cancelled by the user'), this.props.displayName, this.state.instanceName);
    // FIXME bad
    miqRedirectBack(message, 'success', '/vm_infra/explorer/');
  }

  validation = (values) => {
    const errors = {};
    if (values.child_vms.includes(values.parent_vm)) {
      errors.parent_vm = __('Child VM cannot be the same as Parent VM');
    }
    return errors;
  }

  render() {
    const { recordId, showTitle, displayName } = this.props;
    const { isLoaded, initialValues, schema, instanceName } = this.state;
    if (! isLoaded)
      return null;

    const titleText = showTitle && sprintf(__('Editing %s "%s"'), displayName, instanceName);

    return (
      <>
        {showTitle && (
          <h1>{titleText}</h1>
        )}
        <Grid fluid>
          <MiqFormRenderer
            className={'form-react-fullwidth'}
            initialValues={initialValues}
            validate={this.validation}
            schema={schema}
            onSubmit={this.submitValues}
            onReset={() => add_flash(__('All changes have been reset'), 'warn')}
            onCancel={this.cancelClicked}
            canReset={!!recordId}
            buttonsLabels={{
              submitLabel: recordId ? __('Save') : __('Add'),
            }}
          />
        </Grid>
      </>
    );
  }
}

VmEditForm.propTypes = {
  recordId: PropTypes.string,
  emsId: PropTypes.string,
  showTitle: PropTypes.bool,
  displayName: PropTypes.string.isRequired,
  isTemplate: PropTypes.bool.isRequired,
};

VmEditForm.defaultProps = {
  recordId: undefined,
  showTitle: true,
};

export default VmEditForm;
