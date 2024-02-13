export const miqPolicySetListData = {
  items: [
    {
      label: 'Description',
      value: '& Application SLA &',
    },
    {
      icon: 'pficon pficon-image',
      value: 'description one &&',
      title: 'View this Policy',
      onclick: { url: '/miq_policy/show/1' },
    },
    {
      icon: 'pficon pficon-container-node',
      value: 'description two &&',
      title: 'View this Policy',
      onclick: { url: '/miq_policy/show/2' },
    },
    {
      icon: 'pficon pficon-virtual-machine',
      value: 'description three &&',
      title: 'View this Policy',
      onclick: { url: '/miq_policy/show/3' },
    },
  ],
  title: 'Policies',
  mode: 'miq_policy_set',
};
