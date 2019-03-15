import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import { hostnameValidator, asyncValidate } from './validators';

const createVMwareEndpoints = () => [{
  component: 'validate-credentials',
  name: 'vmware-endpoints-valid',
  asyncValidate,
  fields: [{
    component: componentTypes.TEXT_FIELD,
    label: __('Hostname (or IPv4 or IPv6 address)'),
    name: 'vmware_hostname',
    validateOnMount: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    },
    value => hostnameValidator(value, __('Wrong hostname format')),
    ],
  }, {
    component: componentTypes.TEXT_FIELD,
    type: 'number',
    name: 'vmware_api_port',
    label: __('API Port'),
    initialValue: 443,
    validateOnMount: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }, {
    component: componentTypes.TEXT_FIELD,
    label: __('Username'),
    name: 'vmware_userid',
    validateOnMount: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }, {
    component: componentTypes.TEXT_FIELD,
    label: __('Password'),
    name: 'vmware_password',
    type: 'password',
    validateOnMount: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }],
}];

const createVMwareEvents = amqpSecurityProtocol => [
  {
    component: 'validate-credentials',
    name: 'vmware-events-valid',
    asyncValidate,
    fields: [{
      component: componentTypes.RADIO,
      label: 'Event',
      name: 'vmware_event_stream_selection',
      options: [{
        label: 'Ceilometer',
        value: 'ceilometer',
      }, {
        label: 'AMQP',
        value: 'amqp',
      }],
    }, {
      component: componentTypes.SUB_FORM,
      name: 'vmware-amqp-fields',
      condition: {
        when: 'vmware_event_stream_selection',
        is: 'amqp',
      },
      fields: [{
        component: componentTypes.SELECT,
        name: 'vmware_amqp_security_protocol',
        label: __('Security Protocol'),
        options: amqpSecurityProtocol.map(([label, value]) => ({ value, label })),
        validate: [{
          type: validatorTypes.REQUIRED,
        }],
      }, {
        component: componentTypes.TEXT_FIELD,
        label: __('Hostname (or IPv4 or IPv6 address)'),
        name: 'vmware_event_hostname',
        validateOnMount: true,
        validate: [{
          type: validatorTypes.REQUIRED,
        },
        value => hostnameValidator(value, __('Wrong hostname format')),
        ],
      }, {
        component: componentTypes.TEXT_FIELD,
        type: 'number',
        name: 'vmware_events_api_port',
        label: __('API Port'),
        initialValue: 5672,
      }, {
        component: componentTypes.TEXT_FIELD,
        label: __('Username'),
        name: 'vmware_events_userid',
        validateOnMount: true,
        validate: [{
          type: validatorTypes.REQUIRED,
        }],
      }, {
        component: componentTypes.TEXT_FIELD,
        label: __('Password'),
        name: 'vmware_events_password',
        type: 'password',
        validateOnMount: true,
        validate: [{
          type: validatorTypes.REQUIRED,
        }],
      }],
    }],
  }];

export const createVMwareTabs = amqpSecurityProtocol => [{
  component: componentTypes.TABS,
  name: 'vmware-tabs',
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Vmware::CloudManager',
  },
  fields: [{
    component: componentTypes.TAB_ITEM,
    key: 'default',
    title: __('Default'),
    fields: createVMwareEndpoints(),
  }, {
    component: componentTypes.TABS,
    key: 'events',
    title: __('Events'),
    fields: createVMwareEvents(amqpSecurityProtocol),
  }],
}];

export const createVMwareGeneralFields = vmWareCloudApiVersions => [{
  component: componentTypes.SELECT,
  name: 'vmware_cloud_api_version',
  label: __('API Version'),
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Vmware::CloudManager',
  },
  initialValue: '9.0',
  placeholder: `<${__('blank')}>`,
  options: vmWareCloudApiVersions.map(([label, value]) => ({ value, label })),
}];
