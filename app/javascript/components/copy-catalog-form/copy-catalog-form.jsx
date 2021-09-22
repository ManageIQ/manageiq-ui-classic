import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'carbon-components-react';
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
    const { originName } = this.props;
    this.setState(() => ({
      schema: createSchema(),
      initialValues: {
        name: `Copy of ${originName}`,
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
    const { catalogId } = this.props;
    http.post('/catalog/save_copy_catalog', { id: catalogId, name: values.name, copy_tags: values.copy_tags }, { skipErrors: [400] })
      .then(() => miqAjaxButton('/catalog/servicetemplate_copy_saved'))
      .catch((error) => add_flash(this.handleError(error), 'error'));
  };

  render() {
    const { isLoaded, initialValues, schema } = this.state;
    if (!isLoaded) return null;
    const { catalogId } = this.props;
    const cancelUrl = `/catalog/servicetemplate_copy_cancel/${catalogId}`;

    return (
      <Grid>
        <MiqFormRenderer
          initialValues={initialValues}
          schema={schema}
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
