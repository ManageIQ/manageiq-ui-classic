export const infoData = {
  title: _('Info'),
  mode: 'miq_alert_info',
  items: [
    { label: _('Description'), value: 'bar' },
    { label: _('Active'), value: 'Yes' },
    { label: _('Severity'), value: '' },
    { label: _('Based On'), value: 'Server' },
    { label: _('Expression'), value: 'Expression' },
    { label: _('What to Evaluate'), value: 'What to evaluate' },
    { label: _('Driving Event'), value: 'Hourly' },
    { label: _('Notification Frequency'), value: '1 Hour' },
  ],
};

export const expressionData = {
  title: _('Expression'),
  mode: 'miq_alert_expression',
  message: _('An alert must contain a valid expression.'),
  items: [
    { value: _('Expression1'), style: { color: 'black' } },
    { value: _('Expression2'), style: { color: 'black' } },
    { value: _('Expression3'), style: { color: 'black' } },
  ],
};

export const parameterData = {
  title: _('Expression Type Parameters'),
  mode: 'miq_alert_parameters',
  items: [
    { label: _('Description type 1'), value: 'type1 value1' },
    {
      label: _('Description type 2'),
      value: [
        { value: 'type2 value1' },
        { value: 'type2 value2' },
      ],
    },
    { label: _('Description type 3'), value: 'type3 value1', style: { color: 'red' } },
  ],
};

export const smsData = {
  title: _('Send SNMP Trap'),
  mode: 'miq_alert_send_sms',
  items: [
    {
      label: _('Host'),
      value: [
        { value: 'value1' },
        { value: 'value2' },
      ],
    },
    {
      label: _('Version'),
      value: [
        { value: 'value1' },
        { value: 'value2' },
      ],
    },
    { label: _('Trap Number'), value: '123' },
  ],
};

export const variableData = {
  title: _('Variables'),
  mode: 'miq_alert_variable',
  labels: [_('Variable Object ID'), _('Type'), _('Value')],
  items: [
    ['object_id', 'type', 'value'],
    ['object_id', 'type', 'value'],
    ['object_id', 'type', 'value'],
  ],
};

export const timelineData = {
  title: _('Timeline Event'),
  mode: 'miq_alert_timeline_event',
  items: [
    { label: _('Show on Timeline'), value: 'True' },
  ],
};

export const managementData = {
  title: _('Send Management Event'),
  mode: 'miq_alert_management_event',
  items: [
    { label: _('Event Name'), value: 'Event name' },
  ],
};

export const alertProfileData = {
  title: _('Belongs to Alert Profiles'),
  mode: 'miq_alert_profiles',
  message: _('This Alert is not assigned to any Alert Profiles.'),
  items: [
    {
      cells: [
        { icon: 'pficon pficon-warning-triangle-o', value: 'Alert description' },
      ],
      title: 'View this Alert Profile',
      onclick: { url: '/miq_alert_set/show/1' },
    },
    {
      cells: [
        { icon: 'pficon pficon-warning-triangle-o', value: 'Alert description' },
      ],
      title: 'View this Alert Profile',
      onclick: { url: '/miq_alert_set/show/2' },
    },
    {
      cells: [
        { icon: 'pficon pficon-warning-triangle-o', value: 'Alert description' },
      ],
      title: 'View this Alert Profile',
      onclick: { url: '/miq_alert_set/show/3' },
    },
  ],
};

export const alertReferencedData = {
  title: _('Referenced by Actions'),
  mode: 'miq_alert_referenced',
  message: _('This Alert is not referenced by any Actions.'),
  items: [
    {
      cells: [
        { icon: 'pficon pficon-warning-triangle-o', value: 'Alert description' },
      ],
      title: 'View this Action',
      onclick: { url: '/miq_action/show/1' },
    },
    {
      cells: [
        { icon: 'pficon pficon-warning-triangle-o', value: 'Alert description' },
      ],
      title: 'View this Action',
      onclick: { url: '/miq_action/show/2' },
    },
    {
      cells: [
        { icon: 'pficon pficon-warning-triangle-o', value: 'Alert description' },
      ],
      title: 'View this Action',
      onclick: { url: '/miq_action/show/3' },
    },
  ],
};
