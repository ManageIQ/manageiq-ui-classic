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
    const { ownershipItems } = this.props;
    this.loadInitialData(ownershipItems);
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

  /**
   * The ownershipItems can be 'vms', 'services' and 'templates'.
   * Vms and Services have the user & group id in resources object.
   * Templates have the user & group id in the base object.
   */
  getInitialValues = ownershipItems => new Promise((resolve) => {
    if (ownershipItems.length > 1) {
      resolve({ group: 'dont-change', user: 'dont-change' });
    } else {
      const item = ownershipItems[0];
      if (item.kind !== 'templates') {
        API.get(`/api/${item.kind}/${item.id}?expand=resources&attributes=evm_owner_id,miq_group_id`)
          .then(results => resolve({ group: results.miq_group_id, user: results.evm_owner_id }));
      } else {
        API.get(`/api/${item.kind}/${item.id}?attributes=evm_owner_id,miq_group_id`)
          .then(results => resolve({ group: results.miq_group_id, user: results.evm_owner_id }));
      }
    }
  });

  loadInitialData = (ownershipItems) => {
    Promise.all([
      API.get('/api/users?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending'),
      API.get('/api/groups?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending'),
      this.getInitialValues(ownershipItems),
    ]).then(([userOptions, groupOptions, initialValues]) => {
      // Checking if the group is tenant group or not
      new Promise((resolve) => {
        if (ownershipItems.length > 1) {
          resolve('');
        } else {
          API.get(`/api/tenant_groups/${initialValues.group}`, { skipErrors: true })
            .then(response => resolve(response.id))
            .catch(() => resolve(''));
        }
      }).then(tenantGroupId => this.setState({
        userOptions: this.addOptions(ownershipItems, 'user', userOptions.resources.map(user => [user.name, user.id])),
        groupOptions: this.addOptions(ownershipItems, 'group', groupOptions.resources.map(group => [group.description, group.id]), tenantGroupId),
        initialValues,
      }));
    });
  };

  handleSubmit = (values, objectIds, url) => miqAjaxButton(url, {
    objectIds,
    ...values,
  });

  render() {
    const { ownershipItems } = this.props;
    const { initialValues, userOptions, groupOptions } = this.state;
    const cancelUrl = `/${ManageIQ.controller}/ownership_update/?button=cancel`;
    const submitUrl = `/${ManageIQ.controller}/ownership_update/?button=save`;

    return (
      <Grid fluid id="set-ownership-form">
        <MiqFormRenderer
          initialValues={initialValues}
          schema={createSchema(userOptions, groupOptions)}
          onSubmit={values => this.handleSubmit(values, Array.from(ownershipItems, item => item.id), submitUrl)}
          onReset={() => add_flash(__('All changes have been reset'), 'warn')}
          onCancel={() => miqAjaxButton(cancelUrl)}
          canReset
        />
      </Grid>
    );
  }
}

SetOwnershipForm.propTypes = {
  ownershipItems: PropTypes.arrayOf(PropTypes.exact({ id: PropTypes.string, kind: PropTypes.string })).isRequired,
};

export default SetOwnershipForm;
