import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = ({
  roles, tenants, canLookupLdap, authModeName, readOnly,
  currentTenantName, tags, hacTree, vatTree, superAdminUser,
}) => ({
  fields: [
    {
      component: componentTypes.SUB_FORM,
      id: 'group-information',
      name: 'group-information',
      title: __('Group Information'),
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          id: 'description',
          name: 'description',
          label: __('Description'),
          maxLength: 50,
          isRequired: !readOnly,
          isReadOnly: readOnly,
          validate: readOnly ? [] : [{ type: validatorTypes.REQUIRED }],
          autoFocus: !readOnly,
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'detailed_description',
          name: 'detailed_description',
          label: __('Detailed Description'),
          maxLength: 255,
          isReadOnly: readOnly,
        },
        {
          component: componentTypes.SELECT,
          id: 'role_id',
          name: 'role_id',
          label: __('Role'),
          placeholder: __('<Choose a Role>'),
          isRequired: !readOnly,
          isReadOnly: readOnly,
          options: roles,
          includeEmpty: true,
          validate: readOnly ? [] : [{ type: validatorTypes.REQUIRED }],
        },
        {
          component: componentTypes.SELECT,
          id: 'tenant_id',
          name: 'tenant_id',
          label: __('Project/Tenant'),
          placeholder: __('<Choose a Project/Tenant>'),
          isRequired: !readOnly,
          isReadOnly: readOnly,
          options: tenants,
          includeEmpty: true,
          validate: readOnly ? [] : [{ type: validatorTypes.REQUIRED }],
        },
        ...(canLookupLdap && !readOnly ? [
          {
            component: componentTypes.TEXT_FIELD,
            id: 'ldap_user',
            name: 'ldap_user',
            label: sprintf(__('User to Look Up (%s Groups)'), authModeName),
          },
        ] : []),
      ],
    },
    {
      component: 'filter-tabs',
      name: 'filters',
      currentTenantName,
      tags: tags || { tags: [], assignedTags: [], affectedItems: [] },
      hacTree,
      vatTree,
      readOnly,
      superAdminUser,
    },
  ],
});

export default createSchema;
