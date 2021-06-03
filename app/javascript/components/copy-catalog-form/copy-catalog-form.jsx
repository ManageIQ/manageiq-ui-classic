import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './copy-catalog-form.schema';
import { http } from '../../http_api';

class CopyCatalogForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
    };
  }

  componentDidMount() {
    add_flash(__('The copied item will not be displayed in the catalog by default'), 'info');
    this.setState(() => ({
      schema: createSchema(),
      initialValues: {
        // eslint-disable-next-line react/destructuring-assignment
        name: `Copy of ${this.props.originName}`,
        copy_tags: false,
      },
      isLoaded: true,
    }));
  }

  handleError = (error) => {
    const { data: { error: { message } } } = error;
    return !!message ? message : __('Selected item can not be copied. Because it\'s Ansible Playbook or not valid.');
  };

  submitValues = (values) => {
    // eslint-disable-next-line react/destructuring-assignment
    http.post('/catalog/save_copy_catalog', { id: this.props.catalogId, name: values.name, copy_tags: values.copy_tags }, { skipErrors: [400] })
      .then(() => miqAjaxButton('/catalog/servicetemplate_copy_saved'))
      .catch((error) => add_flash(this.handleError(error), 'error'));
  };

  render() {
    // eslint-disable-next-line react/destructuring-assignment
    if (!this.state.isLoaded) return null;
    // eslint-disable-next-line react/destructuring-assignment
    const cancelUrl = `/catalog/servicetemplate_copy_cancel/${this.props.catalogId}`;

    return (
      <Grid fluid>
        <MiqFormRenderer
          // eslint-disable-next-line react/destructuring-assignment
          initialValues={this.state.initialValues}
          // eslint-disable-next-line react/destructuring-assignment
          schema={this.state.schema}
          onSubmit={this.submitValues}
          onCancel={() => miqAjaxButton(cancelUrl)}
          buttonsLabels={{
            submitLabel: __('Add'),
          }}
          disableSubmit={['invalid']}
        />
      </Grid>
    );
  }
}

CopyCatalogForm.propTypes = {
  catalogId: PropTypes.string,
  originName: PropTypes.string,
};

CopyCatalogForm.defaultProps = {
  catalogId: undefined,
  originName: '',
};

export default CopyCatalogForm;
