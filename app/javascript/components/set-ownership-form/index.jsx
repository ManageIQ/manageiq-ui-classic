import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import { http } from '../../http_api';
import createSchema from './ownership-form.schema';

class SetOwnershipForm extends Component {
  state = {
    initialValues: {},
  }

  componentDidMount() {
    const { ownershipIds } = this.props;
    this.loadInitialData(ownershipIds);
  }

  loadInitialData = objectIds =>
    http.post(`/${ManageIQ.controller}/ownership_form_fields`, { object_ids: objectIds })
      .then(data => this.setState({ initialValues: data }))


  handleSubmit = (values, objectIds, url) => miqAjaxButton(url, {
    objectIds,
    ...values,
  })

  render() {
    const { groupOptions, ownerOptions, ownershipIds } = this.props;
    const { initialValues } = this.state;
    const cancelUrl = `/${ManageIQ.controller}/ownership_update/?button=cancel`;
    const submitUrl = `/${ManageIQ.controller}/ownership_update/?button=save`;

    return (
      <Grid fluid id="set-ownership-form">
        <MiqFormRenderer
          initialValues={initialValues}
          schema={createSchema(ownerOptions, groupOptions)}
          onSubmit={values => this.handleSubmit(values, ownershipIds, submitUrl)}
          onReset={() => add_flash(__('All changes have been reset'), 'warn')}
          onCancel={() => miqAjaxButton(cancelUrl)}
          canReset
        />
      </Grid>
    );
  }
}

SetOwnershipForm.propTypes = {
  ownershipIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  groupOptions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  ownerOptions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
};

export default SetOwnershipForm;
