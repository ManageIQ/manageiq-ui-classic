import { componentTypes } from '@@ddf';

function createSchema(securityGroups) {
  const fields = [
    {
      component: componentTypes.SELECT,
      id: 'security_group',
      name: 'security_group',
      label: __('Security Group'),
      placeholder: __('<Choose>'),
      includeEmpty: true,
      options: securityGroups,
    },
  ];
  return { fields };
}

export default createSchema;
