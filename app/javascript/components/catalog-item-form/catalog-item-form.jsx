import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './catalog-item-form.schema';
import { http } from '../../http_api';

class CatalogItemForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      schema: null,
      item: {},
    };
  }

  componentDidMount() {
    miqSparkleOn();
    const { catalogItemId } = this.props;
    http.get(`/catalog/catalog_item_data/` + catalogItemId)
      .then((data) => {
        this.data = data;
        this.setState({ isLoaded: true, schema: createSchema(this.data), item: data.item}, miqSparkleOff);
      });
  }

  submitValues = () => {

  };

  handleStateUpdate = (values) => {
    if (!values.dirty || values.active !== "catalog_item_type") {
      return;
    }
    if (values.active === "catalog_item_type") {
      this.formType = values.values.catalog_item_type;
      console.log("this.formType: ", this.formType);
      this.setState({ schema: createSchema(this.formType, this.data) });
    };
  };

  render() {
    const { isLoaded, schema, item } = this.state;
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
          showFormControls={false}
          initialValues={item}
          onStateUpdate={this.handleStateUpdate}
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
