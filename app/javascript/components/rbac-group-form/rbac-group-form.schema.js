import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = ({
  roles, tenants, readOnly,
  currentTenantName, tags, hacTree, vatTree, superAdminUser,
}) => ({
  fields: [
    ...(!readOnly ? [{
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
          isRequired: true,
          validate: [{ type: validatorTypes.REQUIRED }],
          autoFocus: true,
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'detailed_description',
          name: 'detailed_description',
          label: __('Detailed Description'),
          maxLength: 255,
        },
        {
          component: componentTypes.SELECT,
          id: 'role_id',
          name: 'role_id',
          label: __('Role'),
          placeholder: __('<Choose a Role>'),
          isRequired: true,
          options: roles,
          includeEmpty: true,
          validate: [{ type: validatorTypes.REQUIRED }],
        },
        {
          component: componentTypes.SELECT,
          id: 'tenant_id',
          name: 'tenant_id',
          label: __('Project/Tenant'),
          placeholder: __('<Choose a Project/Tenant>'),
          isRequired: true,
          options: tenants,
          includeEmpty: true,
          validate: [{ type: validatorTypes.REQUIRED }],
        },
      ],
    }] : []),
    {
      component: 'filter-tabs',
      name: 'filters',
      currentTenantName,
      tags: tags || { tags: [], assignedTags: [], affectedItems: [] },
      hacTree,
      vatTree,
      readOnly,
      superAdminUser,
      validate: [(value) => {
        if (value?.useFilterExpression && value?.expressionHasErrors) {
          return __('Expression is incomplete or invalid.');
        }
        return undefined;
      }],
    },
  ],
});

export default createSchema;
