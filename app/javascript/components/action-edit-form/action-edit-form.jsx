import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './action-edit-form.schema';
// import { API } from '../../http_api';

const ActionEditForm = ({actionTypes, scanProfiles, cancelUrl, submitUrl, alerts, categories, selectedCategories, parentTypes, playbooks, snmpVersions}) => {
  console.log(selectedCategories);
  const initialValues = { inherit_parent_tags_select: selectedCategories, remove_tags_select: selectedCategories };
  return  (
    <Grid fluid>
      <MiqFormRenderer
        initialValues={initialValues}
        schema={createSchema(255, actionTypes, scanProfiles, alerts, categories, selectedCategories, parentTypes, playbooks, snmpVersions )}
        onSubmit={(e) => console.log('submit', e)}
        onCancel={() => miqAjaxButton(cancelUrl)}
        onReset={() => add_flash(__('All changes have been reset'), 'warn')}
        // canReset={!!cloudNetworkId}
      />
    </Grid>
  );
}

export default ActionEditForm
