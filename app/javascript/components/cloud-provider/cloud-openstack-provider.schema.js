import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import { hostnameValidator, asyncValidate } from './validators';

const createOpenstackEndpointsFields = openstackSecurityProtocols => [{
  component: componentTypes.SUB_FORM,
  name: 'openstack-endpoints',
  title: __('Default Endpoints'),
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Openstack::CloudManager',
  },
  fields: [{
    component: componentTypes.SELECT,
    name: 'openstacl_security_protocol',
    label: __('Security Protocol'),
    placeholder: `<${__('Choose')}>`,
    options: openstackSecurityProtocols.map(([label, value]) => ({ value, label })),
    validateOnMount: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }, {
    component: componentTypes.TEXT_FIELD,
    type: 'number',
    name: 'openstack_api_port',
    label: __('API Port'),
    initialValue: 13000,
    validateOnMount: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }, {
    component: 'validate-credentials',
    name: 'openstack-endpoints-valid',
    asyncValidate,
    fields: [{
      component: componentTypes.TEXT_FIELD,
      label: __('Hostname (or IPv4 or IPv6 address)'),
      name: 'openstack_hostname',
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      },
      value => hostnameValidator(value, __('Wrong hostname format')),
      ],
    }, {
      component: componentTypes.TEXT_FIELD,
      label: __('Client ID'),
      name: 'azure_userid',
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
    }, {
      component: componentTypes.TEXT_FIELD,
      label: __('Client Key'),
      name: 'azure_password',
      type: 'password',
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
    }],

  }],
}];

const createOpenstackEventsFields = amqpSecurityProtocol => [{
  component: componentTypes.SUB_FORM,
  name: 'openstack-events',
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Openstack::CloudManager',
  },
  fields: [{
    component: componentTypes.RADIO,
    label: 'Event',
    name: 'openstack_event_stream_selection',
    options: [{
      label: 'Ceilometer',
      value: 'ceilometer',
    }, {
      label: 'AMQP',
      value: 'amqp',
    }],
  }, {
    component: componentTypes.SUB_FORM,
    name: 'openstack-amqp-fields',
    condition: {
      when: 'openstack_event_stream_selection',
      is: 'amqp',
    },
    fields: [{
      component: componentTypes.SELECT,
      name: 'openstack_amqp_security_protocol',
      label: 'Security Protocol',
      options: amqpSecurityProtocol.map(([label, value]) => ({ value, label })),
    }, {
      component: componentTypes.TEXT_FIELD,
      label: __('Hostname (or IPv4 or IPv6 address)'),
      name: 'amqp_hostname',
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      },
      value => hostnameValidator(value, __('Wrong hostname format'))],
    }, {
      component: componentTypes.TEXT_FIELD,
      label: __('Fallback Hostname 1'),
      placeholder: __('Hostname or IPV4 or IPV6 address'),
      name: 'amqp_fallback_hostname1',
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      },
      value => hostnameValidator(value, __('Wrong hostname format'))],
    }, {
      component: componentTypes.TEXT_FIELD,
      label: __('Fallback Hostname 2'),
      placeholder: __('Hostname or IPV4 or IPV6 address'),
      name: 'amqp_fallback_hostname2',
      validateOnMount: true,
      validate: [value => hostnameValidator(value, __('Wrong hostname format'))],
    }, {
      component: componentTypes.TEXT_FIELD,
      type: 'number',
      name: 'amqp_api_port',
      label: __('API Port'),
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
    }, {
      component: 'validate-credentials',
      name: 'amqp-endpoints-valid',
      asyncValidate,
      fields: [{
        component: componentTypes.TEXT_FIELD,
        label: __('Username'),
        name: 'amqp_userid',
        validateOnMount: true,
        validate: [{
          type: validatorTypes.REQUIRED,
        }],
      }, {
        component: componentTypes.TEXT_FIELD,
        label: __('Password'),
        name: 'amqp_password',
        type: 'password',
        validateOnMount: true,
        validate: [{
          type: validatorTypes.REQUIRED,
        }],
      }],
    }],
  }],
}];

const createRsaFields = () => [{
  component: componentTypes.SUB_FORM,
  name: 'opstanc-rsa-key-pair-fields',
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Openstack::CloudManager',
  },
  fields: [{
    component: componentTypes.TEXT_FIELD,
    label: __('Username'),
    name: 'ssh_keypair_userid',
  }, {
    component: componentTypes.TEXT_FIELD,
    label: __('Private Key'),
    name: 'ssh_keypair_password',
    type: 'file',
  }],
}];

export const createOpenstackTabs = (openstackSecurityProtocols, amqpSecurityProtocol) => [{
  component: componentTypes.TABS,
  name: 'open-stack-tabs',
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Openstack::CloudManager',
  },
  fields: [{
    component: componentTypes.TAB_ITEM,
    key: 'default',
    title: __('Default'),
    fields: createOpenstackEndpointsFields(openstackSecurityProtocols),
  }, {
    component: componentTypes.TAB_ITEM,
    key: 'events',
    title: __('Events'),
    fields: createOpenstackEventsFields(amqpSecurityProtocol),
  }, {
    component: componentTypes.TAB_ITEM,
    key: 'rsa',
    title: __('RSA key pair'),
    fields: createRsaFields(),
  }],
}];

export const createOpenStackGeneralFields = (openStackApiVersion, openstackInfraProviders) => [{
  component: componentTypes.SELECT,
  name: 'api_version',
  label: __('API Version'),
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Openstack::CloudManager',
  },
  initialValue: 'v2',
  options: openStackApiVersion.map(([label, value]) => ({ value, label })),
  validateOnMount: true,
  validate: [{
    type: validatorTypes.REQUIRED,
  }],
}, {
  component: componentTypes.TEXT_FIELD,
  name: 'openstac_provider_region',
  label: __('Region'),
  validateOnMount: true,
  validate: [{
    type: validatorTypes.REQUIRED,
  }],
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Openstack::CloudManager',
  },
}, {
  component: componentTypes.TEXT_FIELD,
  name: 'openstack_keystone_domain_id',
  label: __('Keystone V3 Domain ID'),
  condition: {
    when: 'api_version',
    is: 'v3',
  },
}, {
  component: componentTypes.SELECT,
  name: 'provider_id',
  label: __('Openstack Infra Provider'),
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Openstack::CloudManager',
  },
  placeholder: `<${__('blank')}>`,
  options: openstackInfraProviders,
}];
