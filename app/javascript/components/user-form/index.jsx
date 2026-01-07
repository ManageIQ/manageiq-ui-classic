import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import createSchema from './user-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { API } from '../../http_api';
import { passwordValidation } from './helper';

const UserForm = ({
  id, copyUserId, disabled, dbMode,
}) => {
  const [{
    initialValues, isLoading, editMode, groups, selectedGroups, // Use to populate the custom component
  }, setState] = useState({ isLoading: true });

  useEffect(() => {
    if (id) {
      Promise.all([API.get('/api/groups?&expand=resources'), API.get(`/api/users/${id}?&attributes=miq_groups`)])
        .then(([{ resources }, userData]) => {
          const availableGroups = [];
          resources.forEach((group) => {
            availableGroups.push({ label: group.description, value: group.id });
          });

          const selectedGroups = [];
          const selectedGroupIds = [];
          userData.miq_groups.forEach((group) => {
            selectedGroups.push(group.description);
            selectedGroupIds.push(group.id);
          });
          userData.groups = selectedGroupIds;
          userData.selectedGroups = selectedGroups;
          setState({
            initialValues: userData,
            isLoading: false,
            editMode: false,
            groups: availableGroups,
            selectedGroups,
          });
        });
    } else {
      const promises = [API.get('/api/groups?&expand=resources')];
      if (copyUserId) {
        promises.push(API.get(`/api/users/${copyUserId}?&attributes=miq_groups`));
      }
      Promise.all(promises).then(([{ resources }, userData]) => {
        const availableGroups = [];
        resources.forEach((group) => {
          availableGroups.push({ label: group.description, value: group.id });
        });

        const values = {};
        const selectedGroups = [];
        const selectedGroupIds = [];
        if (userData) {
          if (userData.name) {
            values.name = userData.name;
          }
          if (userData.email) {
            values.email = userData.email;
          }
          if (userData.miq_groups) {
            userData.miq_groups.forEach((group) => {
              selectedGroups.push(group.description);
              selectedGroupIds.push(group.id);
            });
            values.groups = selectedGroupIds;
            values.selectedGroups = selectedGroups;
          }
        }

        setState({
          initialValues: values,
          isLoading: false,
          editMode: false,
          groups: availableGroups,
          selectedGroups: [],
        });
      });
    }
  }, []);

  const onSubmit = (values) => {
    miqSparkleOn();
    if (values.email === undefined) {
      values.email = '';
    }
    const groupIds = new Set();
    const sortedGroupIds = [];
    const groupIdObjects = [];
    values.groups.forEach((group) => {
      if (group.value) {
        groupIds.add(group.value);
      } else {
        groupIds.add(group);
      }
    });
    groupIds.forEach((group) => {
      sortedGroupIds.push(group);
    });
    sortedGroupIds.sort();
    sortedGroupIds.forEach((group) => {
      groupIdObjects.push({ id: group });
    });
    if (id) {
      if (values.confirmPassword && values.confirmPassword === values.password) {
        API.post(`/api/users/${id}`,
          {
            action: 'edit',
            resource: {
              name: values.name,
              userid: values.userid,
              password: values.password,
              email: values.email,
              miq_groups: groupIdObjects,
            },
          }).then(() => {
          miqRedirectBack(`User ${values.name} was saved`, 'success', '/ops/');
        });
      } else {
        API.post(`/api/users/${id}`,
          {
            action: 'edit',
            resource: {
              name: values.name,
              userid: values.userid,
              email: values.email,
              miq_groups: groupIdObjects,
            },
          }).then(() => {
          miqRedirectBack(`User ${values.name} was saved`, 'success', '/ops/');
        });
      }
      miqSparkleOff();
    } else {
      API.post('/api/users', {
        name: values.name,
        userid: values.userid,
        password: values.password,
        email: values.email,
        miq_groups: groupIdObjects,
      }).then(() => {
        miqRedirectBack(`User ${values.name} was saved`, 'success', '/ops/');
      });
      miqSparkleOff();
    }
  };

  const onCancel = () => {
    const url = '/ops/';
    let message = '';
    message = __('Add of new User was cancelled by the user');
    miqRedirectBack(message, 'success', url);
  };

  const onFormReset = () => {
    const temp = initialValues;
    temp.selectedGroups = selectedGroups;
    setState((state) => ({
      ...state,
      initialValues: temp,
      editMode: false,
    }));
    add_flash(__('All changes have been reset'), 'warn');
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return !isLoading && (
    <div className="col-md-12 user-form">
      <MiqFormRenderer
        schema={createSchema(id, editMode, setState, disabled, dbMode, groups, selectedGroups)}
        initialValues={initialValues}
        validate={(values) => passwordValidation(initialValues, id, editMode, values, setState, selectedGroups)}
        onSubmit={onSubmit}
        onCancel={onCancel}
        canReset={!!id}
        onReset={onFormReset}
        buttonsLabels={{
          submitLabel: id ? __('Submit') : __('Add'),
        }}
      />
    </div>
  );
};

UserForm.propTypes = {
  id: PropTypes.number,
  copyUserId: PropTypes.number,
  disabled: PropTypes.bool,
  dbMode: PropTypes.string.isRequired,
};

UserForm.defaultProps = {
  id: undefined,
  copyUserId: undefined,
  disabled: false,
};

export default UserForm;
