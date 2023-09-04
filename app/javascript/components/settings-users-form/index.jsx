import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './schema';
import { resources } from '../../spec/schedule-form/data';
import handleFailure from '../../helpers/handle-failure';

const SettingsUsersForm = ({ recordId }) => {
  const newRecord = recordId === 'new';

  const [data, setData] = useState({
    isLoading: !!recordId,
    groups: [],
    initialValues: undefined,
    userid: '',
  });
  // const groups = values.groupIds.map(groupId => ({id :groupId}));
  const validatorMapper = {
    'same-password': () => (value, allValues) => value !== allValues.password ? 'Password do not match' : undefined
  }

  const redirectUrl = (newRecord, button) => `/ops/settings_users_helper/${newRecord}?button=${button}`;

  const USER_ACTIONS = {
    CREATE: 'create',
    SAVE: 'save',
    CANCEL: 'cancel',
    RESET: 'reset',
  };

  /** Generate dropdown options from resources */
  const groupOptions = (resources) => resources.map((item) => ({label: item.description, value: item.id}))

  /** Fetch data from the API on component mount */
  useEffect(() => {
    if (recordId && !newRecord) {
      Promise.all([
        API.get(`/api/groups?expand=resources`),
        API.get(`/api/users/${recordId}?expand=resources/`)])
        .then(([groups, users]) => {
          console.log(groups,"groupid");
          console.log(users,"userid");
          setData({
            ...data,
            isLoading: false,
            groups: groupOptions(groups.resources),
            initialValues: users,
            userid: users.userid || '',
          });
        });
    } else {
      API.get(`/api/groups?expand=resources`).then(({resources}) => {
        setData({
          ...data,
          groups: groupOptions(resources),
          isLoading: false
        });
      })
    }
  }, [recordId]);

  console.log(data,"initial values")

  /** Function to handle form submission */
  const onSubmit = (values, newRecord, recordId) => {
    const userPayload = {
      userid: values.userid,
      password: values.password,
      name: values.name,
      email:values.email,
      group: { id:20},
    };

    console.log(values,"values")
    const url = newRecord ? '/api/users' : `/api/users/${recordId}`;
      API.post(url, userPayload, {
        skipErrors: [400, 500]
      })
      .then((response) => {
        const createdRecordId = newRecord ? response.id : recordId;
        window.miqJqueryRequest(redirectUrl(createdRecordId));
      })
      .catch(handleFailure);

  };

  const onCancel = () => {
    /** If it's a new record, redirect to the previous page */
    if (newRecord) {
      window.miqJqueryRequest(redirectUrl(recordId, USER_ACTIONS.CANCEL));
    } else {
      /** For an existing user, reset the form values to the initial state */
      setState({ initialValues, isLoading: false });
    }
  };

  return !data.isLoading && (
    <MiqFormRenderer
      schema={createSchema(newRecord, data.groups, data.userid)}
      initialValues={data.initialValues}
      onSubmit={onSubmit}
      onCancel={() => onCancel()}
      canReset={!newRecord}
      buttonsLabels={{
        submitLabel: newRecord ? __('Add') : __('Save')
      }}
      validatorMapper={validatorMapper}
    />
  );
};

SettingsUsersForm.propTypes = {
  recordId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default SettingsUsersForm;
