import { componentTypes, validatorTypes } from '@@ddf';
import { Edit16 } from '@carbon/icons-react';

function createSchema(id, editMode, setState, disabled, dbMode, availableGroups, selectedGroups) {
  const fields = [
    {
      component: componentTypes.TEXT_FIELD,
      label: __('Full Name'),
      maxLength: 50,
      id: 'name',
      name: 'name',
      isDisabled: disabled,
      isRequired: true,
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      }],
    },
    {
      component: componentTypes.TEXT_FIELD,
      label: __('Username'),
      maxLength: 255,
      id: 'userid',
      name: 'userid',
      isDisabled: disabled,
      isRequired: true,
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      }],
    },
    ...(dbMode === 'database' || (dbMode !== 'database' && disabled) ? [
      ...(id ? [
        ...(editMode ? [
          {
            component: 'edit-password-field',
            label: __('Password'),
            id: 'password',
            name: 'password',
            maxLength: 50,
            editMode,
            disabled: !editMode,
            setEditMode: () => {
              setState((state) => ({
                ...state,
                editMode: !editMode,
              }));
            },
            placeholder: '●●●●●●●●',
            buttonLabel: editMode ? __('Cancel') : __('Change'),
          },
          {
            component: componentTypes.TEXT_FIELD,
            label: __('Confirm Password'),
            maxLength: 50,
            type: 'password',
            id: 'confirmPassword',
            name: 'confirmPassword',
            initialValue: '',
            isRequired: true,
          },
        ] : [
          {
            component: 'edit-password-field',
            label: __('Password'),
            maxLength: 50,
            id: 'passwordPlaceholder',
            name: 'passwordPlaceholder',
            icon: Edit16,
            kind: 'primary',
            editMode,
            disabled: true,
            setEditMode: () => {
              setState((state) => ({
                ...state,
                editMode: !editMode,
              }));
            },
            placeholder: '●●●●●●●●',
            buttonLabel: editMode ? __('Cancel') : __('Change'),
          },
        ]),
      ] : [
        {
          component: componentTypes.TEXT_FIELD,
          label: __('Password'),
          maxLength: 50,
          type: 'password',
          id: 'password',
          name: 'password',
          isRequired: true,
          validate: [{
            type: validatorTypes.REQUIRED,
            message: __('Required'),
          }],
        },
        {
          component: componentTypes.TEXT_FIELD,
          label: __('Confirm Password'),
          maxLength: 50,
          type: 'password',
          id: 'confirmPassword',
          name: 'confirmPassword',
          initialValue: '',
          isRequired: true,
          validate: [{
            type: validatorTypes.REQUIRED,
            message: __('Required'),
          }],
        },
      ])] : []),
    {
      component: componentTypes.TEXT_FIELD,
      label: __('E-mail Address'),
      maxLength: 255,
      id: 'email',
      name: 'email',
      validate: [{
        type: validatorTypes.PATTERN,
        pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,}$',
        message: __('Email must be a valid email address'),
      }],
    },
    {
      component: componentTypes.SELECT,
      label: __('Available Groups'),
      id: 'groups',
      name: 'groups',
      isDisabled: disabled,
      isMulti: true,
      isRequired: true,
      placeholder: __('<Choose one or more Groups>'),
      options: availableGroups,
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      }],
      onChange: (values) => {
        const groups = [];
        values.forEach((group) => {
          if (group.label) {
            groups.push(group.label);
          } else {
            availableGroups.forEach((availableGroup) => {
              if (availableGroup.value === group) {
                groups.push(availableGroup.label);
              }
            });
          }
        });
        setState((state) => ({
          ...state,
          selectedGroups: groups,
        }));
      },
    },
    {
      component: 'selected-groups-list',
      label: __('Selected Groups'),
      name: 'selected-groups',
      groups: selectedGroups,
    },
  ];
  return { fields };
}

export default createSchema;
