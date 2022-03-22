export const infoData = {
  title: _('Basic Information'),
  mode: 'miq_action_info',
  items: [
    { label: _('Description'), value: 'bar' },
    { label: _('Action Type'), value: 'Default' },
  ],
};

export const actionTypeData1 = {
  title: _('Snapshot Settings'),
  mode: 'miq_action_info',
  items: [
    { label: _('Name'), value: 'Snapshot name' },
  ],
};

export const actionTypeData2 = {
  title: _('Custom Automation'),
  mode: 'miq_action_info',
  items: [
    { label: _('Object Details') },
    { label: _('Starting Message'), value: 'Message' },
    { label: _('Request'), value: 'Request' },
    {
      label: _('Attribute/Value Pairs'),
      value: [
        { value: 'pair1' },
        { value: 'pair2' },
        { value: 'pair3' },
      ],
    },
  ],
};

export const actionTypeData3 = {
  title: _('Alerts to Evaluate'),
  mode: 'miq_action_info',
  message: _('No Alerts have been selected.'),
  items: [
    {
      cells: [
        { icon: 'pficon pficon-warning-triangle-o', value: 'Alert description' },
      ],
      title: 'View this Alert',
      onclick: '/miq_policy/x_show/al-#{alert.id}?accord=alert',
    },
  ],
};

export const actionPoliciesData = {
  title: _('Assigned to Policies'),
  mode: 'miq_action',
  message: _('This Action is not assigned to any Policies.'),
  items: [
    {
      cells: [
        { icon: 'pficon pficon-warning-triangle-o', value: 'Alert description' },
      ],
      title: 'View this Alert',
      onclick: "DoNav('/miq_policy/show/1');",
    },
  ],
};
