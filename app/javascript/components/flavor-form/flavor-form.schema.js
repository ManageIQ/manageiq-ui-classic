import { componentTypes, validatorTypes } from '@@ddf';

function addSchema(emsList = [], cloudTenants = []) {
  const fields = [
    {
      component: componentTypes.SELECT,
      id: 'ems_id',
      name: 'ems_id',
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
      options: emsList.map(item => ({ label: item.name, value: item.id })),
      label: __('Provider'),
      validateOnMount: true,
      isSearchable: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      }],
      label: __('Name'),
      validateOnMount: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'ram',
      name: 'ram',
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      },
      {
        type: validatorTypes.PATTERN,
        pattern: '^[-+]?[0-9]\\d*$',
        message: __('Ram must be integer'),
      },
      {
        type: validatorTypes.MIN_NUMBER_VALUE,
        value: 1,
        message: __('Ram must be greater than 0'),
      },
      ],
      label: __('Ram size in MB'),
      dataType: 'integer',
      type: 'number',
      validateOnMount: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'vcpus',
      name: 'vcpus',
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      },
      {
        type: validatorTypes.PATTERN,
        pattern: '^[-+]?[0-9]\\d*$',
        message: __('VCPUs must be integer'),
      },
      {
        type: validatorTypes.MIN_NUMBER_VALUE,
        value: 1,
        message: __('VCPUs must be greater than 0'),
      }],
      label: __('VCPUs'),
      dataType: 'integer',
      type: 'number',
      validateOnMount: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'disk',
      name: 'disk',
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      },
      {
        type: validatorTypes.PATTERN,
        pattern: '^[-+]?[0-9]\\d*$',
        message: __('Disk size must be integer'),
      },
      {
        type: validatorTypes.MIN_NUMBER_VALUE,
        value: 1,
        message: __('Disk size must be greater than 0'),
      }],
      label: __('Disk size in GB'),
      dataType: 'integer',
      type: 'number',
      validateOnMount: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'swap',
      name: 'swap',
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      },
      {
        type: validatorTypes.PATTERN,
        pattern: '^[-+]?[0-9]\\d*$',
        message: __('Swap size must be integer'),
      },
      {
        type: validatorTypes.MIN_NUMBER_VALUE,
        value: 0,
        message: __('Swap size must be greater or equal to 0'),
      }],
      label: __('Swap size in MB'),
      dataType: 'integer',
      type: 'number',
      validateOnMount: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'rxtx_factor',
      name: 'rxtx_factor',
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      },
      {
        type: validatorTypes.PATTERN,
        pattern: '^[-+]?[0-9]\\d*\\.?\\d*$',
        message: __('RXTX factor must be number'),
      },
      {
        type: validatorTypes.MIN_NUMBER_VALUE,
        value: 0,
        message: __('RXTX factor must be greater than or equal to 0'),
      }],
      label: __('RXTX factor'),
      type: 'number',
      validateOnMount: true,
    },
    {
      component: componentTypes.SWITCH,
      id: 'is_public',
      name: 'is_public',
      label: __('Public?'),
      bsSize: 'mini',
      onText: __('True'),
      offText: __('False'),
    },
    {
      component: componentTypes.SELECT,
      id: 'cloud_tenant_refs',
      name: 'cloud_tenant_refs',
      options: cloudTenants.map(item => ({ label: item.name, value: item.ems_ref })),
      label: __('Cloud Tenant'),
      placeholder: __('Nothing selected'),
      isMulti: true,
      condition: {
        when: 'is_public',
        is: false,
      },
      isSearchable: true,
      isClearable: true,
    },
  ];
  return { fields };
}

export default addSchema;
