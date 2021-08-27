import React from 'react';
import { componentTypes, validatorTypes } from '@@ddf';
import Icon from './icons';

const buildUserOptions = (users) => {
  const usersArray = [{ label: __('All Users'), value: 'all' }];
  users.forEach((user) => {
    const tempObj = { label: user, value: user };
    usersArray.push(tempObj);
  });
  return usersArray;
};

const buildOptions = (data) => {
  const dataArray = [];
  data.forEach((value) => {
    const tempObj = { label: value[0], value: value[1] };
    dataArray.push(tempObj);
  });
  return dataArray;
};

const createSchema = (allTasks, zones, users, timePeriods, taskStates) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'zone',
      name: 'zone',
      label: __('Zone'),
      validate: [{ type: validatorTypes.REQUIRED }],
      options: buildOptions(zones),
      initialValue: 'all',
    },
    ...(allTasks ? [
      {
        component: componentTypes.SELECT,
        id: 'user',
        name: 'user',
        label: __('User'),
        validate: [{ type: validatorTypes.REQUIRED }],
        options: buildUserOptions(users),
        initialValue: 'all',
      },
    ] : []),
    {
      component: componentTypes.SELECT,
      id: 'timePeriod',
      name: 'timePeriod',
      label: __('24 Hour Time Period'),
      validate: [{ type: validatorTypes.REQUIRED }],
      options: buildOptions(timePeriods),
      initialValue: '0',
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'TaskStatus',
      name: 'TaskStatus',
      fields: [
        {
          component: componentTypes.CHECKBOX,
          id: 'taskStatus',
          name: 'taskStatus',
          label: __('Task Status'),
          initialValue: ['queued', 'running', 'completed_ok', 'completed_error', 'completed_warn'],
          isRequired: true,
          validate: [{
            type: validatorTypes.REQUIRED,
            message: __('At least one task status is required'),
          }],
          options: [
            {
              value: 'queued',
              label: <Icon text="Queued" icon="carbon--SkipForwardFilled" color="#363636" size={16} />,
            },
            {
              value: 'running',
              label: <Icon text="Running" icon="carbon--CircleDash" color="#363636" size={16} />,
            },
            {
              value: 'completed_ok',
              label: <Icon text="Ok" icon="carbon--CheckmarkOutline" color="#3f9c35" size={16} />,
            },
            {
              value: 'completed_error',
              label: <Icon text="Error" icon="carbon--MisuseOutline" color="#cc0000 " size={16} />,
            },
            {
              value: 'completed_warn',
              label: <Icon text="Warn" icon="carbon--WarningAlt" color="#ec7a08" size={16} />,
            },
          ],
        }],
    },
    {
      component: componentTypes.SELECT,
      id: 'taskState',
      name: 'taskState',
      label: __('Task State'),
      validate: [{ type: validatorTypes.REQUIRED }],
      options: buildOptions(taskStates),
      initialValue: 'all',
    },
  ],
});

export default createSchema;
