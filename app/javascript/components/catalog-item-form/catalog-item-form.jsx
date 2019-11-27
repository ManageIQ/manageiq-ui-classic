import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './catalog-item-form.schema';
import { http } from '../../http_api';
import handleFailure from '../../helpers/handle-failure';


class CatalogItemForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
    };
  }

  componentDidMount() {
    const catalog = http.get(`/catalog/catalogs_for_catalog_item`)
      .then((data) => {
        this.catalogs = data;
      });
    const currency = http.get(`/catalog/currencies_for_catalog_item`)
      .then((data) => {
        this.currencies = data;
      });
    const zone = http.get(`/catalog/zones_for_catalog_item`)
      .then((data) => {
        this.zones = data;
      });
    const dialog = http.get(`/catalog/dialogs_for_catalog_item`)
      .then((data) => {
        debugger;
        this.dialogs = data;
      });
    Promise.all([catalog, currency, zone, dialog])
      .then(() => {
        this.setState({ isLoaded: true });
      });
  }

  submitValues = () => {

  };

  render() {
    //const { catalogItemId, type } = this.props;
    const { isLoaded } = this.state;
    const cancelUrl = `/TODO?button=cancel`;
    if (!isLoaded) return null;

    return (
      <Grid fluid>
        <MiqFormRenderer
          schema={createSchema(this.catalogs, this.dialogs, this.zones, this.currencies)}
          onSubmit={this.submitValues}
          onCancel={() => miqAjaxButton(cancelUrl)}
          onReset={() => add_flash(__('All changes have been reset'), 'warn')}
          canReset={true}
          buttonsLabels={{
            submitLabel: true ? __('Save') : __('Add'),
          }}
        />
      </Grid>
    );
  }
}

CatalogItemForm.propTypes = {
};

CatalogItemForm.defaultProps = {
};

export default CatalogItemForm;
