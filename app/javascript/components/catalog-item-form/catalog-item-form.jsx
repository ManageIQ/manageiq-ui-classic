import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './catalog-item-form.schema';


class CatalogItemForm extends Component {
  constructor(props) {
    super(props);
   // this.state = {
   //   isLoaded: false,
   // };
  }

  componentDidMount() {


  }

  submitValues = () => {

  };

  render() {
    //const { catalogItemId, type } = this.props;
    //const { isLoaded, initialValues } = this.state;
    const catalogs = [{id: 1, name: "CATALOG"}];
    const dialogs = [{id: 1, name: "DIALOG"}];
    const zones = [{id: 1, name: "ZONE"}];
    const currencies = [{id: 1, name: "CURRENCY"}];

    const cancelUrl = `/TODO?button=cancel`;
    //if (!isLoaded) return null;

    return (
      <Grid fluid>
        <MiqFormRenderer
          schema={createSchema(catalogs, dialogs, zones, currencies)}
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
