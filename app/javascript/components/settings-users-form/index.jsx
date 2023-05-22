import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './schema';
import { resources } from '../../spec/schedule-form/data';

const SettingsUsersForm = ({ recordId }) => {
  const newRecord = recordId === 'new';
  const [{ initialValues, isLoading, groups }, setState] = useState({ isLoading: !!recordId });

  const redirectUrl = (newRecord, button) => `/ops/settings_users_helper/${newRecord}?button=${button}`;

  const CATEGORY_ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    SAVE: 'save',
    CANCEL: 'cancel',
    RESET: 'reset',
  };
  console.log(newRecord,"newRecord")
  useEffect(() => {
    const fullName = API.get('/api/groups?expand=resources/${recordId}');
    // API.get(`/api/groups?expand=resources/${recordId}`)
    //     .then((initialValues) => {
    //       setState({ initialValues, isLoading: false });
    //     })
    //     .catch((error) => {
    //       console.error('API call failed:', error);
    //     });
    if (newRecord) {
      setState({ isLoading: false });
    } else {
      API.get(`/api/groups?expand=resources/${recordId}`)
        .then((initialValues) => {
          setState({ initialValues, isLoading: false });
        })
        .catch((error) => {
          console.error('API call failed:', error);
        });
    }
  }, [recordId]);
  console.log(recordId,"recordid")

  const onSubmit = (values) => {
    const params = newRecord
      ? { data: values, button: CATEGORY_ACTIONS.ADD, url: `/api/groups/` }
      : { data: { resource: values, action: CATEGORY_ACTIONS.EDIT }, button: CATEGORY_ACTIONS.SAVE, url: `/api/groups` };

    API.post(params.url, params.data, { skipErrors: [400, 500] })
      .then((response) => {
        const recordId = (newRecord && response && response.results && response.results[0])
          ? response.results[0].id
          : recordId;
        window.miqJqueryRequest(redirectUrl(recordId, params.button));
      })
      .catch(handleFailure);
  };
  const onCancel = () => {
    // If it's a new record, redirect to the previous page
    if (newRecord) {
      window.miqJqueryRequest(redirectUrl(recordId, CATEGORY_ACTIONS.CANCEL));
    } else {
      // For an existing user, reset the form values to the initial state
      setState({ initialValues, isLoading: false });
    }
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(newRecord)}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={() => onCancel()}
      canReset={!newRecord}
      buttonsLabels={{
        submitLabel: newRecord ? __('Add') : __('Cancel'),
      }}
    />
  );
};

SettingsUsersForm.propTypes = {
  recordId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default SettingsUsersForm;
