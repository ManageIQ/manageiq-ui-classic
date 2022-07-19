/** Usage eg: Control / Policies / Item / Conditions */
export const miqPolicyConditionsData = {
  headers: [_('Description'), _('Scopes / Expressions')],
  rows: [
    {
      cells: [
        { icon: 'fonticon', value: 'description' },
        [
          { label: _('Scope'), value: 'expression' },
          { label: _('Expression'), value: 'expression' },
        ],
      ],
      title: ('View this Condition'),
      onclick: "DoNav('/condition/show/1');",
    },
    {
      cells: [
        { icon: 'fonticon', value: 'description' },
        [
          { label: _('Expression'), value: 'expression' },
        ],
      ],
      title: ('View this Condition'),
      onclick: "DoNav('/condition/show/2');",
    },
  ],
};

/** Usage eg: Control / Policies / Item / Events */
export const miqPolicyEventsData = {
  headers: [_('Description'), _('Scopes / Expressions')],
  rows: [
    {
      cells: [
        { icon: 'pficon pficon-image', value: 'description', onclick: "DoNav('/miq_event_definition/show/#{1}');" },
        [
          { value: { icon: 'pficon pficon-ok', value: 'value 1', onclick: "DoNav('/miq_action/show/1')" } },
          { value: { icon: 'pficon pficon-ok', value: 'value 2', onclick: "DoNav('/miq_action/show/2')" } },
        ],
      ],
    },
    {
      cells: [
        { icon: 'pficon pficon-image', value: 'description', onclick: "DoNav('/miq_event_definition/show/#{2}');" },
        [
          { value: { icon: 'pficon pficon-ok', value: 'value 3', onclick: "DoNav('/miq_action/show/3')" } },
          { value: { icon: 'pficon pficon-ok', value: 'value 4', onclick: "DoNav('/miq_action/show/4')" } },
        ],
      ],
    },
  ],
};

/** Usage eg: Control / Policies / Item / Belongs to profile */
export const miqProfileData = [
  {
    cells: [
      { icon: 'pficon pficon-image', value: 'Container Image Compliance' }, 'OpenSCAP',
    ],
    title: 'View this Container Image Policy',
    onclick: "DoNav('/miq_policy/show/1');",
  },
];
