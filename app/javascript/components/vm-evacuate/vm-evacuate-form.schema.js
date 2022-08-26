import { componentTypes, validatorTypes } from '@@ddf';

const tempOpts = [
  {value: 1, label: "label 1"},
  {value: 2, label: "label 2"},
  {value: 3, label: "label 3"}
]

const createSchema = () => ({
  fields: [
    {
      component: componentTypes.CHECKBOX,
      label: __('Auto-select Host?'),
      name: 'auto_select_host',
      id: 'auto_select_host',
      // isDisabled: vm.hosts.length == 0
      // isHidden: vm.hosts.length == 0 ???
    },
    {
      component: componentTypes.SELECT,
      label: __('Select Destination Host'),
      name: 'destination_host',
      id: 'destination_host',
      options: tempOpts, // host.name as host.name for host in vm.hosts track by host.id (????)
      // get the list of hosts associatiaed to the chosen vm ???
      condition: {
        when: 'auto_select_host',
        is: false,
      },
    },
    {
      component: componentTypes.CHECKBOX,
      label: __('On Shared Storage'),
      name: 'on_shared_storage',
      id: 'on_shared_storage',
    },
    {
      component: componentTypes.TEXT_FIELD, // TODO make this 'password' or 'secret'
      label: __('Admin Password'),
      name: 'admin_password',
      id: 'admin_password',
      condition: {
        when: 'on_shared_storage',
        is: false,
      },
    },
  ],
});

export default createSchema;
