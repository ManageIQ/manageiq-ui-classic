import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './schema';
import { resources } from '../../spec/schedule-form/data';


// Later in your component's JSX:
{/* <button disabled={isDisabled}>Submit</button> */}


const SettingsUsersForm = ({ recordId }) => {
  const newRecord = recordId === 'new';
  const [data, setData] = useState({
    isLoading: !!recordId,
    groups: [],
    initialValues: undefined,
  });

  const redirectUrl = (newRecord, button) => `/ops/settings_users_helper/${newRecord}?button=${button}`;

  const CATEGORY_ACTIONS = {
    ADD: 'add',
    SAVE: 'save',
    CANCEL: 'cancel',
    RESET: 'reset',
  };
  console.log(newRecord,"newRecord")

  /** Data used for drop down list in Available Groups */
  const groupOptions = (resources) => resources.map((item) => ({label: item.description, value: item.id}))

  useEffect(() => {
    if (recordId) {
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
          });
        });
    } else {
      API.get(`/api/groups?expand=resources`).then(({resources}) => {
        setState({
          ...data,
          groups: groupOptions(resources),
          isLoading: false
        });
      })
    }

    // API.get(`/api/groups?expand=resources/${user_id}`)
    //     .then((initialValues) => {
    //       setState({ initialValues, isLoading: false });
    //     })
    //     .catch((error) => {
    //       console.error('API call failed:', error);
    //     });
    // if (newRecord) {
    //   setState({ isLoading: false });
    // } else {
    //   API.get(`/api/users/${recordId}?expand=resources/`)
    //     .then((initialValues) => {
    //       setState({ initialValues, isLoading: false });
    //     })
    //     .catch((error) => {
    //       console.error('API call failed:', error);
    //     });
    // }
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

  return !data.isLoading && (
    <MiqFormRenderer
      schema={createSchema(newRecord, data.groups)}
      initialValues={data.initialValues}
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
