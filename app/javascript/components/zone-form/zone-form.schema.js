import { componentTypes } from '@@ddf';

const createSchema = () => ({
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
                    maxLength: 50,
                },
                {
                    component: componentTypes.TEXT_FIELD,
                    id: 'description',
                    name: 'description',
                    label: __('Description'),
                    maxLength: 50,
                },
                {
                    component: componentTypes.TEXT_FIELD,
                    id: 'proxy_server_ip',
                    name: 'proxy_server_ip',
                    label: __('SmartProxy Server IP'),
                    maxLength: 50,
                }         
            ]
        },
        {
            component: componentTypes.SUB_FORM,
            name: 'ntp-servers-subform',
            title: __('NTP Servers'),
            description: __("* Specified NTP settings apply to this zone only and are not global."),    
            fields: [
                { 
                    component: componentTypes.TEXT_FIELD,
                    id: 'ntp_server_1',
                    name: 'ntp_server_1',
                    initialValue: "0.pool.ntp.org",
                    maxLength: 50,  
                },
                {
                    component: componentTypes.TEXT_FIELD,
                    id: 'ntp_server_2',
                    name: 'ntp_server_2',
                    initialValue: "1.pool.ntp.org",
                    maxLength: 50,  
                },
                {
                    component: componentTypes.TEXT_FIELD,
                    id: 'ntp_server_3',
                    name: 'ntp_server_3',
                    initialValue: "2.pool.ntp.org",
                    maxLength: 50,  
                },
            ]
        },
        {
            component: componentTypes.SUB_FORM,
            name: 'credentials-subform',
            title: __('Credentials - Windows Domain'),
            fields: [
                {
                    component: componentTypes.TEXT_FIELD,
                    id: 'userid',
                    name: 'userid',
                    label: __('Username'),
                    maxLength: 50,  
                },
                {
                    component: 'password-field',
                    id: 'password',
                    name: 'password',
                    label: __('Password'),
                    maxLength: 50,  
                },
                {
                    component: 'password-field',
                    id: 'verify',
                    name: 'verify',
                    label: __('Verify Password'),
                    maxLength: 50,  
                },
            ]
        },
        {
            component: componentTypes.SUB_FORM,
            name: 'settings-subform',
            title: __('Settings'),
            fields: [
                {
                    component: 'select',
                    id: 'select',
                    name: 'select',
                    label: __('Max Active VM Scans'),
                    options: [
                        { label: __('Unlimited'), value: 0 },
                        ...Array(4).fill().map((_, i) => ({ label: i+1, value: i+1 })),
                        ...Array(10).fill().map((_, i) => ({ label: 5*(i+1), value: 5*(i+1) }))
                    ]
                },
            ]
            
        }

    ],
});

export default createSchema;
