import { componentTypes, validatorTypes } from '@@ddf';
import { transformSelectOptions } from '../helper';

const createClassFieldsSchema = (aeClassId, selectedRowId, aeTypeOptions,
  dTypeOptions, schemaField = {}) => {
  const classField = schemaField;

  const formatName = () => {
    const fullName = classField.name.text;
    const match = fullName.match(/^(.+?)\s*\(([^)]+)\)$/);

    if (classField.display_name && 'text' in classField.display_name) {
      return {
        display_name: classField.display_name.text,
        name: (match && match[2]) || fullName,
      };
    }
    return {
      display_name: (match && match[1]) || '',
      name: (match && match[2]) || fullName,
    };
  };

  const getIcons = (index) => {
    if (
      classField
      && typeof classField === 'object'
      && Object.keys(classField).length > 0
      && classField.name
      && 'icon' in classField.name
    ) {
      let icons = classField.name.icon;
      if (icons.length === 2) {
        // icons come in the order [aetype, dtype, substitute]
        // aetype and substitute will be present always; so rearrange index 1 and 2
        icons = [icons[0], '', icons[1]];
      }
      return icons[index];
    }
    return '';
  };

  const getInitialValue = (field, defaultVal = '') => {
    if (
      classField
      && typeof classField === 'object'
      && Object.keys(classField).length > 0
    ) {
      if (selectedRowId !== undefined) {
        if (field === 'name' || field === 'display_name') {
          const formatted = formatName();
          return formatted[field] || defaultVal;
        }
        if (field === 'substitute') {
          if (classField[field] && 'text' in classField[field]) {
            return classField[field].text !== undefined && classField[field].text !== null
              ? classField[field].text
              : defaultVal;
          }
          const icon = getIcons(2);
          return icon === 'pficon pficon-ok';
        }
        if (field === 'message') {
          return classField[field].text;
        }
        return classField[field].text || defaultVal;
      }

      if (classField[field] && 'text' in classField[field]) {
        return classField[field].text || defaultVal;
      }
    }

    return defaultVal;
  };

  const getType = (options, icon) => {
    const match = options.find(
      (item) => item[2] && item[2]['data-icon'] === icon
    );

    return match ? match[1] : null;
  };

  return {
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        id: 'name',
        label: __('Name'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        initialValue: getInitialValue('name'),
      },
      {
        component: componentTypes.SELECT,
        name: 'aetype',
        id: 'aetype',
        label: __('Type'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        placeholder: __('<Choose>'),
        options: transformSelectOptions(aeTypeOptions),
        includeEmpty: true,
        initialValue: getType(aeTypeOptions, getIcons(0)),
      },
      {
        component: componentTypes.SELECT,
        name: 'datatype',
        id: 'datatype',
        label: __('Data Type'),
        placeholder: __('<Choose>'),
        includeEmpty: true,
        options: transformSelectOptions(dTypeOptions),
        initialValue: getType(dTypeOptions, getIcons(1)),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'default_value',
        id: 'default_value',
        label: __('Default Value'),
        initialValue: getInitialValue('default_value'),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'display_name',
        id: 'display_name',
        label: __('Display Name'),
        initialValue: getInitialValue('display_name'),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'description',
        id: 'description',
        label: __('Description'),
        initialValue: getInitialValue('description'),
      },
      {
        component: componentTypes.CHECKBOX,
        name: 'substitute',
        id: 'substitute',
        label: __('Sub'),
        initialValue: getInitialValue('substitute', true),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'collect',
        id: 'collect',
        label: __('Collect'),
        initialValue: getInitialValue('collect'),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'message',
        id: 'message',
        label: __('Message'),
        initialValue: getInitialValue('message', 'create'),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'on_entry',
        id: 'on_entry',
        label: __('On Entry'),
        initialValue: getInitialValue('on_entry'),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'on_exit',
        id: 'on_exit',
        label: __('On Exit'),
        initialValue: getInitialValue('on_exit'),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'on_error',
        id: 'on_error',
        label: __('On Error'),
        initialValue: getInitialValue('on_error'),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'max_retries',
        id: 'max_retries',
        label: __('Max Retries'),
        initialValue: getInitialValue('max_retries'),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'max_time',
        id: 'max_time',
        label: __('Max Time'),
        initialValue: getInitialValue('max_time'),
      },
    ],
  };
};

export default createClassFieldsSchema;
