import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './catalog-item-form.schema';
import { http } from '../../http_api';
import handleFailure from '../../helpers/handle-failure';
import CatalogForm from '../catalog-form/catalog-form';


class CatalogItemForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      schema: null,
    };
  }

  componentDidMount() {
    const { catalogItemId } = this.props;
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
        this.dialogs = data;
      });
   /* const data = http.get(`/catalog/catalog_item_data/?` + catalogItemId)
      .then((data) => {
        this.data = data;
      });*/
    Promise.all([catalog, currency, zone, dialog])
      .then(() => {
        this.formType = "";
        this.types = [{ id: 'generic', name: "Generic" },
          { id: 'amazon', name: "Amazon" },
          { id: 'generic_orchestration', name: "GO" },
          { id: 'generic_ansible_tower', name: "AnsibleTower" },
          { id: 'generic_container_template', name: "Generic Container" },
          { id: 'catalog_bundle', name: "Catalog Bundle" },
          { id: 'others', name: "Others" }];
        this.setState({ isLoaded: true , schema: createSchema(this.formType, this.types, this.catalogs, this.dialogs, this.zones, this.currencies)});
      });
  }

  submitValues = () => {

  };

  handleStateUpdate = (values) => {
    if (!values.dirty || values.active !== "catalog_item_type") {
      return;
    }
    if (values.active === "catalog_item_type") {
      debugger;
      this.formType = values.values.catalog_item_type;
      console.log("this.formType: ", this.formType);
      this.setState({ schema: createSchema(this.formType, this.types, this.catalogs, this.dialogs, this.zones, this.currencies) });
    };
  };

  render() {
    //const { catalogItemId, type } = this.props;
    const { isLoaded, schema } = this.state;
    const cancelUrl = `/TODO?button=cancel`;
    if (!isLoaded) return null;

    return (
      <Grid fluid>
        <MiqFormRenderer
          schema={schema}
          onSubmit={this.submitValues}
          onCancel={() => miqAjaxButton(cancelUrl)}
          onReset={() => add_flash(__('All changes have been reset'), 'warn')}
          canReset={true}
          onStateUpdate={this.handleStateUpdate}
          buttonsLabels={{
            submitLabel: true ? __('Save') : __('Add'),
          }}
        />
      </Grid>
    );
  }
}

CatalogItemForm.propTypes = {
  catalogItemId: PropTypes.string,
};

CatalogItemForm.defaultProps = {
  catalogItemId: undefined,
};

export default CatalogItemForm;
