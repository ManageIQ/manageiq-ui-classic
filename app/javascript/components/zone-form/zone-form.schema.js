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
            fields: [
                { 
                    component: componentTypes.TEXT_FIELD,
                    id: 'ntp_server_1',
                    name: 'ntp_server_1',
                    label: __('Servers'),
                    placeholder: "0.pool.ntp.org",
                    maxLength: 50,  
                },
                {
                    component: componentTypes.TEXT_FIELD,
                    id: 'ntp_server_2',
                    name: 'ntp_server_2',
                    placeholder: "1.pool.ntp.org",
                    maxLength: 50,  
                },
                {
                    component: componentTypes.TEXT_FIELD,
                    id: 'ntp_server_3',
                    name: 'ntp_server_3',
                    placeholder: "2.pool.ntp.org",
                    maxLength: 50,  
                },
                {
                    "component": "plain-text",
                    "name": "settings-plaintext-component",
                    "label": __("* Specified NTP settings apply to this zone only and are not global.")
                }
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
                    component: componentTypes.TEXT_FIELD,
                    id: 'password',
                    name: 'password',
                    label: __('Password'),
                    type: 'password',
                    maxLength: 50,  
                },
                {
                    component: componentTypes.TEXT_FIELD,
                    id: 'verify',
                    name: 'verify',
                    label: __('Verify Password'),
                    type: 'password',
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
                        { label: __('Unlimited'), value: 0 }
                    ]
                    .concat(Array(4).fill().map((_, i) => ({ label: i+1, value: i+1 })))
                    .concat(Array(10).fill().map((_, i) => ({ label: 5*(i+1), value: 5*(i+1) })))
                },
            ]
            
        }

    ],
});

export default createSchema;
