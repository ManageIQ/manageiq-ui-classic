import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './vm-edit-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';

class VmEditForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
    };
  }

  componentDidMount() {
    miqSparkleOn();
    const { choices } = this.props;
    const options = Object.keys(choices).map(vm => ({
      label: vm, value: String(choices[vm]),
    }));
    const optionsDualSelect = Object.keys(choices).map(vm => ({
      label: vm, key: String(choices[vm]),
    }));
    if (this.props.catalogId === 'new') {
      this.setState({ isLoaded: true });
    } else {
      API.get(`/api/vms/${this.props.catalogId}?attributes=child_resources,parent_resource,custom_attributes`).then((data) => {
        const x = data.custom_attributes.find(attribute => (attribute.name === 'custom_1'));
        this.setState(
          {
            initialValues: {
              description: data.description,
              custom_1: x ? x.serialized_value : null,
              parent_vm: data.parent_resource.id,
              service_templates: data.child_resources.map(resource => resource.id),
            },
            instanceName: data.name,
            isLoaded: true,

            schema: createSchema(
              options,
              [
                ...optionsDualSelect,
                ...data.child_resources.map(resource => ({ label: `${resource.name} -- ${resource.location}`, key: resource.id })),
              ],
            ),
          },
        );

        miqSparkleOff();
      });
    }
  }

  submitValues = (values) => {
    // console.log({ values });
    const val = {
      action: 'edit',
      resource: {
        description: values.description,
        custom_1: values.custom_1,
        parent_resource: { href: `/api/vms/${values.parent_vm}` },
        child_resources: values.service_templates.map(vm => ({ href: `/api/vms/${vm}` })),
      },
    };
    // console.log(val);
    // API.post(`/api/vms/${this.props.catalogId}`, val).then(console.log);
  }

  cancelClicked = () => {
    miqSparkleOn();
    const message = sprintf(__('Edit of VM and Instance "%s" was cancelled by the user'), this.state.instanceName);
    miqRedirectBack(message, 'success', '/vm_infra/explorer/');
  }

  validation = (values) => {
    const errors = {};
    if (values.service_templates.includes(values.parent_vm)) {
      errors.parent_vm = __('Child VM cannot be the same as Parent VM');
    }
    return errors;
  }

  render() {
    const { catalogId } = this.props;
    const { isLoaded, initialValues, schema } = this.state;
    if (!isLoaded) return null;

    return (
      <Grid fluid>
        <MiqFormRenderer
          initialValues={initialValues}
          validate={this.validation}
          schema={schema}
          onSubmit={this.submitValues}
          onReset={() => add_flash(__('All changes have been reset'), 'warn')}
          onCancel={this.cancelClicked}
          canReset={catalogId !== 'new'}
          buttonsLabels={{
            submitLabel: catalogId ? __('Save') : __('Add'),
          }}
        />
      </Grid>
    );
  }
}

VmEditForm.propTypes = {
  catalogId: PropTypes.string,
  choices: PropTypes.shape({
    [PropTypes.string]: PropTypes.number,
  }),
};

VmEditForm.defaultProps = {
  catalogId: undefined,
  choices: [],
};

export default VmEditForm;
