import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

function createSchema(formType, data) {
  const fields = [];
  fields.push([
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
        options: data.catalogs.map(({ id, name }) => ({ label: name, value: id })),
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
        options: data.dialogs.map(({ id, name }) => ({ label: name, value: id })),
      }],
    }]);
  if (formType === "@edit[:new][:service_type] == \"composite\"") {
    fields.push({
      component: componentTypes.SELECT,
      name: 'zone_id',
      label: __('Zone'),
      placeholder: `<${__('Choose')}>`,
      isDisabled: false,
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      }],
      options: data.zones.map(({ id, name }) => ({ label: name, value: id })),
    });
  };
  fields.push([
    {
      component: componentTypes.SELECT,
      name: 'currency_id',
      label: __('Currency'),
      placeholder: `<${__('Choose')}>`,
      isDisabled: false,
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      }],
      options: data.currencies.map(({ id, name }) => ({ label: name, value: id })),
    }, {
      component: componentTypes.TEXT_FIELD,
      name: 'price',
      label: __('Price / Month'),
      maxLength: 60,
    }]);
  if (formType === "generic") {
    fields.push([{
      component: componentTypes.SELECT,
      name: 'catalog_item_subtype',
      label: __('Subtype'),
      placeholder: `<${__('Choose')}>`,
      isDisabled: false,
      options: data.types.map(({ id, name }) => ({ label: name, value: id })),
    }]);
  };
  if (formType === "generic_orchestration") {
    fields.push([{
      component: componentTypes.SELECT,
      name: 'catalog_item_orchestration_template',
      label: __('Orchestration Template'),
      placeholder: `<${__('Choose')}>`,
      isDisabled: false,
      options: data.types.map(({ id, name }) => ({ label: name, value: id })),
    }, {
      component: componentTypes.SELECT,
      name: 'catalog_item_provider',
      label: __('Provider'),
      placeholder: `<${__('Choose')}>`,
      isDisabled: false,
      options: data.types.map(({ id, name }) => ({ label: name, value: id })),
    }]);
  };
  if (["generic_ansible_tower", "generic_container_template"].includes(formType)) {
    fields.push([{
      component: componentTypes.SELECT,
      name: 'catalog_item_provider',
      label: __('Provider'),
      placeholder: `<${__('Choose')}>`,
      isDisabled: false,
      options: data.types.map(({ id, name }) => ({ label: name, value: id })),
    }]);
  };
  // catalog_item_provider is selected
  if (formType === "generic_ansible_tower") {
    fields.push([{
      component: componentTypes.SELECT,
      name: 'catalog_item_ansible_tower_template',
      label: __('Ansible Tower Template'),
      placeholder: `<${__('Choose')}>`,
      isDisabled: false,
      options: data.types.map(({ id, name }) => ({ label: name, value: id })),
    }]);
  };
  // catalog_item_provider is selected
  if (formType === "generic_container_template") {
    fields.push([{
      component: componentTypes.SELECT,
      name: 'catalog_item_generic_container_template',
      label: __('Container Template'),
      placeholder: `<${__('Choose')}>`,
      isDisabled: false,
      options: data.types.map(({ id, name }) => ({ label: name, value: id })),
    }]);
  };
  return { fields };
}

export default createSchema;
