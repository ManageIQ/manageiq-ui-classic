import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './catalog-form.schema';
import { filterOptions, filterValues } from '../dual-list-select/helpers';
import { API } from '../../http_api';

class CatalogForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
    };
  }

  componentDidMount() {
    miqSparkleOn();
    const { catalogId } = this.props;
    if (catalogId) {
      Promise.all([
        API.get('/api/service_templates?expand=resources&filter[]=service_template_catalog_id=null'),
        API.get(`/api/service_catalogs/${catalogId}?expand=service_templates`)])
        .then(([{ resources }, { name, description, service_templates }]) => {
          const rightValues = service_templates.resources.map(({ href, name }) => ({ key: href, label: name }));
          const options = resources.map(({ href, name }) => ({ key: href, label: name })).concat(rightValues);
          this.setState(() => ({
            schema: createSchema(options, catalogId),
            initialValues: {
              name,
              description: description === null ? undefined : description,
              service_templates: rightValues.map(({ key }) => key),
            },
            originalRightValues: rightValues,
            isLoaded: true,
          }), miqSparkleOff);
        })
        .catch(({ error: { message } = { message: __('Could not fetch the data') } }) => add_flash(message, 'error'), miqSparkleOff);
    } else {
      API.get('/api/service_templates?expand=resources&filter[]=service_template_catalog_id=null').then(
        ({ resources }) => this.setState({
          schema: createSchema(resources.map(({ href, name }) => ({ key: href, label: name }))),
          isLoaded: true,
        }, miqSparkleOff),
      )
        .catch(({ error: { message } = { message: __('Could not fetch the data') } }) => add_flash(message, 'error'), miqSparkleOff);
    }
  }

  handleError = (error) => {
    const { data: { error: { message } } } = error;
    return message.includes('Name has already been taken') ? __('Name has already been taken') : message;
  }

  submitValues = (values) => {
    const { catalogId } = this.props;
    const { originalRightValues } = this.state;
    const { service_templates = [] } = values;
    const apiBase = `/api/service_catalogs${catalogId ? `/${catalogId}` : ''}`;

    if (!catalogId) {
      return API.post(apiBase, {
        action: 'create',
        resource: {
          ...values,
          service_templates: service_templates.map(key => ({ href: `${key}` })),
        },
      }, {
        skipErrors: [400],
      })
        .then(() => miqAjaxButton('/catalog/st_catalog_edit?button=add', { name: values.name }))
        .catch(error => add_flash(this.handleError(error), 'error'));
    }

    const unassignedRightValues = filterValues(values.service_templates, originalRightValues.map(({ key }) => key));
    const unassignedLeftValues = filterOptions(originalRightValues, values.service_templates);
    const promises = [
      API.post(apiBase, {
        action: 'edit',
        resource: {
          name: values.name,
          description: values.description,
        },
      }, {
        skipErrors: [500],
      }),
    ];

    if (unassignedRightValues.length > 0) {
      promises.push(
        API.post(`${apiBase}/service_templates`, {
          action: 'assign',
          resources: unassignedRightValues.map(key => ({ href: key })),
        }),
      );
    }
    if (unassignedLeftValues.length > 0) {
      promises.push(
        API.post(`${apiBase}/service_templates`, {
          action: 'unassign',
          resources: unassignedLeftValues.map(({ key }) => ({ href: key })),
        }),
      );
    }

    return Promise.all(promises)
      .then(([{ id }]) => miqAjaxButton(`/catalog/st_catalog_edit/${id}?button=save`, { name: values.name }))
      .catch(error => add_flash(this.handleError(error), 'error'));
  };

  render() {
    const { catalogId } = this.props;
    const { isLoaded, initialValues, schema } = this.state;
    const cancelUrl = `/catalog/st_catalog_edit/${catalogId}?button=cancel`;
    if (!isLoaded) return null;

    return (
      <Grid fluid>
        <MiqFormRenderer
          initialValues={initialValues}
          schema={schema}
          onSubmit={this.submitValues}
          onCancel={() => miqAjaxButton(cancelUrl)}
          onReset={() => add_flash(__('All changes have been reset'), 'warn')}
          canReset={!!catalogId}
          buttonsLabels={{
            submitLabel: catalogId ? __('Save') : __('Add'),
          }}
        />
      </Grid>
    );
  }
}

CatalogForm.propTypes = {
  catalogId: PropTypes.string,
};

CatalogForm.defaultProps = {
  catalogId: undefined,
};

export default CatalogForm;
