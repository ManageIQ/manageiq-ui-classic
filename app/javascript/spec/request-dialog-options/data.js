export const data = [
  {
    label: _('Tab 001'),
    content: [
      {
        mode: 'miq_summary request_dialog_options title-001',
        title: 'section-title-001',
        rows: [
          { cells: { label: _('Field 1'), value: _('Value 1') } },
          { cells: { label: _('Field 2'), value: _('Value 2') } },
          { cells: { label: _('Field 3'), value: _('Value 3') } },
        ],
      },
      {
        mode: 'miq_summary request_dialog_options title-002',
        title: 'section-title-002',
        rows: [
          { cells: { label: _('Field 1'), value: _('Value 1') } },
          { cells: { label: _('Field 2'), value: _('Value 2') } },
          { cells: { label: _('Field 3'), value: _('Value 3') } },
          {
            cells: {
              label: _('Field 4'),
              value: {
                input: 'checkbox', checked: true, disabled: true, label: '',
              },
            },
          },
        ],
      },
    ],
  },
  {
    label: _('Tab 002'),
    content: [
      {
        mode: 'miq_summary request_dialog_options title-001',
        title: 'section-title-001',
        rows: [
          { cells: { label: _('Field 1'), value: _('Value 1') } },
          { cells: { label: _('Field 2'), value: _('Value 2') } },
          { cells: { label: _('Field 3'), value: _('Value 3') } },
        ],
      },
      {
        mode: 'miq_summary request_dialog_options title-002',
        title: 'section-title-002',
        rows: [
          { cells: { label: _('Field 1'), value: _('Value 1') } },
          { cells: { label: _('Field 2'), value: _('Value 2') } },
          { cells: { label: _('Field 3'), value: _('Value 3') } },
        ],
      },
    ],
  },
];
