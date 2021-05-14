import { componentTypes } from '@@ddf';

const createSchema = edit => ({
  fields: [
    {
      component: componentTypes.SUB_FORM,
      name: 'zone-information-subform',
      title: __('Zone Information'),  
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          id: 'name',
          name: 'name',
          label: __('Name'),
          isDisabled: edit,
          maxLength: 128,
        }, 
        {
          component: componentTypes.TEXT_FIELD,
          id: 'description',
          name: 'description',
          label: __('Description'),
          maxLength: 128,
        }, 
        {
          component: componentTypes.TEXT_FIELD,
          id: 'settings.proxy_server_ip',
          name: 'settings.proxy_server_ip',
          label: __('SmartProxy Server IP'),
          maxLength: 128,
        },
      ],
    },
    {
        component: componentTypes.SUB_FORM,
        name: 'settings',
        title: __('Settings'),
        fields: [
            {
              component: componentTypes.SELECT,
              id: 'settings.concurrent_vm_scans',
              name: 'settings.concurrent_vm_scans',
              label: __('Max Active VM Scans'),
              maxLength: 128,
              options: [
               { label: __('Unlimited'), value: 0 },
               ...Array(4).fill().map((_, i) => ({ label: (i + 1).toString(), value: i + 1 })),
               ...Array(10).fill().map((_, i) => ({ label: (5 * (i + 1)).toString(), value: 5 * (i + 1) })),

              ],
            }, 
        ]    
    }   
    ],
    });

export default createSchema;