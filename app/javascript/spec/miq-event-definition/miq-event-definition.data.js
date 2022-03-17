export const infoData = {
  title: _('Basic Information'),
  mode: 'miq_event_definition_info',
  items: [
    { label: _('Event Group'), value: 'bar' },
    { label: _('Attached to Policy'), value: 'policy description' },
  ],
};

export const eventDefinitionPolicyData = {
  title: _('Assigned to Policies'),
  mode: 'miq_event_definition_policy',
  message: _('This Event is not assigned to any Policies.'),
  items: [
    {
      cells: [
        { icon: 'pficon pficon-warning-triangle-o', value: 'Policy description' },
      ],
      title: 'View this Model Alert',
      onclick: "DoNav('/miq_policy/show/1');",
    },
  ],
};
