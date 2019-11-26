import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

function createSchema(catalogs, dialogs, zones, currencies) {
  const fields = [
    {
      component: componentTypes.SUB_FORM,
      title: __('Basic Info'),
      fields: [{
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        label: __('Name'),
        maxLength: 40,
        autoFocus: true,
      }, {
        component: componentTypes.TEXT_FIELD,
        name: 'description',
        label: __('Description'),
        maxLength: 60,
      }, {
        component: componentTypes.CHECKBOX,
        name: 'display',
        label: __('Display in Catalog'),
      }, {
        component: componentTypes.SELECT,
        name: 'catalog_id',
        label: __('Catalog'),
        placeholder: `<${__('Choose')}>`,
        isDisabled: false,
        validate: [{
          type: validatorTypes.REQUIRED,
          message: __('Required'),
        }],
        options: catalogs.map(({ id, name }) => ({ label: name, value: id })),
      }, {
        component: componentTypes.SELECT,
        name: 'dialog_id',
        label: __('Dialog'),
        placeholder: `<${__('Choose')}>`,
        isDisabled: false,
        validate: [{
          type: validatorTypes.REQUIRED,
          message: __('Required'),
        }],
        options: dialogs.map(({ id, name }) => ({ label: name, value: id })),
      }, {
        component: componentTypes.SELECT,
        name: 'zone_id',
        label: __('Zone'),
        placeholder: `<${__('Choose')}>`,
        isDisabled: false,
        validate: [{
          type: validatorTypes.REQUIRED,
          message: __('Required'),
        }],
        options: zones.map(({ id, name }) => ({ label: name, value: id })),
      }, {
        component: componentTypes.SELECT,
        name: 'currency_id',
        label: __('Currency'),
        placeholder: `<${__('Choose')}>`,
        isDisabled: false,
        validate: [{
          type: validatorTypes.REQUIRED,
          message: __('Required'),
        }],
        options: currencies.map(({ id, name }) => ({ label: name, value: id })),
      }, {
        component: componentTypes.TEXT_FIELD,
        name: 'price',
        label: __('Price / Month'),
        maxLength: 60,
      }],
    },
  ];
  return { fields };
}

export default createSchema;
