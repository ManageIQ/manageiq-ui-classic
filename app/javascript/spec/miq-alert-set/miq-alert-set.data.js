export const infoData = {
  title: _('Basic Information'),
  mode: 'miq_alert_set_info',
  items: [
    { label: _('Description'), value: 'bar' },
    { label: _('Mode'), value: 'Mode' },
  ],
};

export const alertSetAssignedData = {
  title: _('Assigned To'),
  mode: 'miq_alert_set_assigned',
  items: [
    { label: _('The Enterprise') },
    {
      label: 'Object class',
      value: [
        { value: 'path1' },
        { value: 'path2' },
        { value: 'path3' },
      ],
    },
  ],
};

export const alertSetNotes = {
  title: _('Notes'),
  mode: 'miq_alert_set_notes',
  items: [
    {
      value: {
        input: 'text_area', text: 'text area description', readonly: true, rows: 4,
      },
    },
  ],
};

export const alertSetAlerts = {
  title: _('Alerts'),
  mode: 'miq_alert_set',
  message: _('This Action is not assigned to any Policies.'),
  items: [
    {
      cells: [
        { icon: 'pficon pficon-warning-triangle-o', value: 'Alert description' },
      ],
      title: 'View this Alert',
      onclick: { url: '/miq_alert/show/1' },
    },
  ],
};
