/* eslint-disable camelcase */
import { componentTypes, validatorTypes } from '@@ddf';

const createSubscriptionSchema = (initialValues, subscriptions, form, replicationHelperText, setState, setModalOpen) => {
    const subscriptionFields = ({
        fields: [
        {
            component: 'validate-subscription',
            name: 'validate-sub',
            id: 'validate-sub',
            isRequired: true,
            validate: [{ type: validatorTypes.REQUIRED }],
            skipSubmit: true,
            fields: [
            {
                component: componentTypes.TEXT_FIELD,
                name: 'dbname',
                id: 'dbname',
                label: __('Database'),
                isRequired: true,
                validate: [{ type: validatorTypes.REQUIRED }],
            },
            {
                component: componentTypes.TEXT_FIELD,
                name: 'host',
                id: 'host',
                label: __('Host'),
                isRequired: true,
                validate: [{ type: validatorTypes.REQUIRED }],
            },
            {
                component: componentTypes.TEXT_FIELD,
                name: 'user',
                id: 'user',
                label: __('Username'),
                isRequired: true,
                validate: [{ type: validatorTypes.REQUIRED }],
            },
            {
                component: componentTypes.TEXT_FIELD,
                name: 'password',
                id: 'password',
                label: __('Password'),
                type: 'password',
                // isReadOnly: form.action === 'edit',
                isRequired: true,
                validate: [{ type: validatorTypes.REQUIRED }],
            },
            {
                component: componentTypes.TEXT_FIELD,
                name: 'port',
                id: 'port',
                label: __('Port'),
                isRequired: true,
                validate: [{ type: validatorTypes.REQUIRED }],
            },
            ],
        },
        ],
    });
    return subscriptionFields;
}

export default createSubscriptionSchema;
