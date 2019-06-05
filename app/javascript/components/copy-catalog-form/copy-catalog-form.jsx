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
    this.setState(() => ({
      schema: createSchema(),
      initialValues: {
        name: 'Copy of',
      },
      isLoaded: true,
    }));
  };

  handleError = (error) => {
    const { data: { error: { message } } } = error;
    return !!message ? message : __('There was an error in copying. Item is not valid or Ansible.');
  };

  submitValues = (values) => {
    http.post('/catalog/save_copy_catalog', { id: this.props.catalogId, name: values.name }, { skipErrors: [400] })
      .then(() => miqAjaxButton('/catalog/servicetemplate_copy_saved'))
      .catch((error) => add_flash(this.handleError(error), 'error'));
  };

  render() {
    if (!this.state.isLoaded) return null;
    const cancelUrl = `/catalog/servicetemplate_copy_cancel/${this.props.catalogId}`;

    return (
      <Grid fluid>
        <MiqFormRenderer
          initialValues={this.state.initialValues}
          schema={this.state.schema}
          onSubmit={this.submitValues}
          onCancel={() => miqAjaxButton(cancelUrl)}
          buttonsLabels={{
            submitLabel: __('Add'),
          }}
        />
      </Grid>
    );
  }
}

CopyCatalogForm.propTypes = {
  catalogId: PropTypes.string,
};

CopyCatalogForm.defaultProps = {
  catalogId: undefined,
};

export default CopyCatalogForm;
