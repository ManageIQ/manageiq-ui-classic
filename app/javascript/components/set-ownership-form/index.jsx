import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import { http, API } from '../../http_api';
import createSchema from './ownership-form.schema';

class SetOwnershipForm extends Component {
  state = {
    initialValues: {},
    userOptions: [],
    groupOptions: [],
  };

  componentDidMount() {
    const { ownershipIds } = this.props;
    this.loadInitialData(ownershipIds);
  }

  /**
   * Adds neutral options: "Don't Change" and "No Owner"/"No User Group" to the select box options.
   *
   * @param ownershipIds Array of element ids being edited in the form. If more than one add "Don't Change" option.
   * @param type The type of the options to which elements are currently being added. ('user' or 'group')
   * @param data The data already in the select box. To this the function prepends the new fields.
   * @param tenantGroupId If the type is 'group' and the ownershipIds.length is one then the value of the 'No User Group' field will be this value.
   * @returns {*[]}
   */
  addOptions = (ownershipIds, type, data, tenantGroupId = '') => {
    const ret = [];
    if (ownershipIds.length > 1) {
      ret.push([__('Don\'t change'), 'dont-change']);
    }
    ret.push([type === 'user' ? __('No Owner') : __('No User Group'), ownershipIds.length === 1 ? tenantGroupId : '']);

    return [...ret, ...data];
  };

  loadInitialData = (ownershipIds) => {
    Promise.all([
      API.get('/api/users?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending'),
      API.get('/api/groups?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending'),
      http.post(`/${ManageIQ.controller}/ownership_form_fields`, { object_ids: ownershipIds }),
    ]).then(([userOptions, groupOptions, initialValues]) => {
      // Checking if the group is tenant group or not
      new Promise((resolve) => {
        if (ownershipIds.length > 1) {
          resolve('');
        } else {
          API.get(`/api/tenant_groups/${initialValues.group}`, { skipErrors: true })
            .then(response => resolve(response.id))
            .catch(() => resolve(''));
        }
      }).then(tenantGroupId => this.setState({
        userOptions: this.addOptions(ownershipIds, 'user', userOptions.resources.map(user => [user.name, user.id])),
        groupOptions: this.addOptions(ownershipIds, 'group', groupOptions.resources.map(group => [group.description, group.id]), tenantGroupId),
        initialValues,
      }));
    });
  };

  handleSubmit = (values, objectIds, url) => miqAjaxButton(url, {
    objectIds,
    ...values,
  });

  render() {
    const { ownershipIds } = this.props;
    const { initialValues, userOptions, groupOptions } = this.state;
    const cancelUrl = `/${ManageIQ.controller}/ownership_update/?button=cancel`;
    const submitUrl = `/${ManageIQ.controller}/ownership_update/?button=save`;

    return (
      <Grid fluid id="set-ownership-form">
        <MiqFormRenderer
          initialValues={initialValues}
          schema={createSchema(userOptions, groupOptions)}
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
};

export default SetOwnershipForm;
