export const infoData = {
  title: _('Basic Information'),
  mode: 'miq_condition_info',
  items: [
    { label: _('Description'), value: 'bar' },
  ],
};

export const conditionsScopeData = {
  title: _('Scope'),
  mode: 'miq_condition_scope',
  message: _('No scope defined, the scope of this condition includes all elements.'),
  items: [
    { value: _('Expression1'), style: { color: 'black' } },
    { value: _('Expression2'), style: { color: 'black' } },
    { value: _('Expression3'), style: { color: 'black' } },
  ],
};

export const conditionsExpressionData = {
  title: _('Expression'),
  mode: 'miq_condition_expression',
  message: _('A condition must contain a valid expression.'),
  items: [
    { value: _('Expression1'), style: { color: 'black' } },
    { value: _('Expression2'), style: { color: 'black' } },
    { value: _('Expression3'), style: { color: 'black' } },
  ],
};

export const conditionPoliciesData = {
  title: _('Assigned to Policies'),
  mode: 'miq_condition_policies',
  message: _('This Condition is not assigned to any Policies.'),
  items: [
    {
      cells: [
        { icon: 'pficon pficon-warning-triangle-o', value: 'Alert description' },
      ],
      title: 'View this model policy',
      onclick: "DoNav('/miq_policy/show/1');",
    },
    {
      cells: [
        { icon: 'pficon pficon-warning-triangle-o', value: 'Alert description' },
      ],
      title: 'View this model policy',
      onclick: "DoNav('/miq_policy/show/2');",
    },
    {
      cells: [
        { icon: 'pficon pficon-warning-triangle-o', value: 'Alert description' },
      ],
      title: 'View this model policy',
      onclick: "DoNav('/miq_policy/show/3');",
    },
  ],
};

export const conditionNotes = {
  title: _('Notes'),
  mode: 'miq_condition_notes',
  message: 'No notes have been entered.',
  items: [
    {
      value: {
        input: 'text_area', text: 'text area description', readonly: true, rows: 4,
      },
    },
  ],
};
