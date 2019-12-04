import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

function createSchema(formType, types, catalogs, dialogs, zones, currencies) {
  const fields = [];
  // no catalog type for Catalog Bundle
  if (formType !== "catalog_bundle") {
    fields.push({
      component: componentTypes.SELECT,
      name: 'catalog_item_type',
      label: __('Type'),
      placeholder: `<${__('Choose')}>`,
      isDisabled: false,
      options: types.map(({ id, name }) => ({ label: name, value: id })),
    });
  };
  // do not show other fields if no catalog type is selected
  if (formType === "") {
    return { fields };
  };
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
      options: zones.map(({ id, name }) => ({ label: name, value: id })),
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
      options: currencies.map(({ id, name }) => ({ label: name, value: id })),
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
      options: types.map(({ id, name }) => ({ label: name, value: id })),
    }]);
  };
  if (formType === "generic_orchestration") {
    fields.push([{
      component: componentTypes.SELECT,
      name: 'catalog_item_orchestration_template',
      label: __('Orchestration Template'),
      placeholder: `<${__('Choose')}>`,
      isDisabled: false,
      options: types.map(({ id, name }) => ({ label: name, value: id })),
    }, {
      component: componentTypes.SELECT,
      name: 'catalog_item_provider',
      label: __('Provider'),
      placeholder: `<${__('Choose')}>`,
      isDisabled: false,
      options: types.map(({ id, name }) => ({ label: name, value: id })),
    }]);
  };
  if (["generic_ansible_tower", "generic_container_template"].includes(formType)) {
    fields.push([{
      component: componentTypes.SELECT,
      name: 'catalog_item_provider',
      label: __('Provider'),
      placeholder: `<${__('Choose')}>`,
      isDisabled: false,
      options: types.map(({ id, name }) => ({ label: name, value: id })),
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
      options: types.map(({ id, name }) => ({ label: name, value: id })),
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
      options: types.map(({ id, name }) => ({ label: name, value: id })),
    }]);
  };
  // TODO create a component
  if (formType !== "ansible_playbook") {
    fields.push([{
      component: componentTypes.TEXT_FIELD,
      name: 'provision',
      label: __('Provisioning Entry Point'),
      maxLength: 60,
    }, {
      component: componentTypes.TEXT_FIELD,
      name: 'reconfigure',
      label: __('Reconfigure Entry Point'),
      maxLength: 60,
    }, {
      component: componentTypes.TEXT_FIELD,
      name: 'retirement',
      label: __('Retirement Entry Point'),
      maxLength: 60,
    },
    ]);
  };
  return { fields };
}

export default createSchema;
