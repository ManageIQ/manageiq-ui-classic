export const infoData = {
  title: __('Basic Information'),
  mode: 'miq_alert_set_info',
  items: [
    { label: __('Description'), value: 'bar' },
    { label: __('Mode'), value: 'Mode' },
  ],
};

export const alertSetAssignedData = {
  title: __('Assigned To'),
  mode: 'miq_alert_set_assigned',
  items: [
    { label: __('The Enterprise') },
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
  title: __('Notes'),
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
  title: __('Alerts'),
  mode: 'miq_alert_set',
  message: __('This Action is not assigned to any Policies.'),
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
