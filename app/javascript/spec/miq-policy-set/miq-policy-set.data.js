export const infoData = {
  title: _('Basic Information'),
  mode: 'miq_policy_set_info',
  items: [
    { label: _('Description'), value: 'bar' },
  ],
};

export const miqPolicySetData = {
  title: _('Policies'),
  mode: 'miq_policy_set',
  items: [
    {
      cells: [
        { icon: 'pficon pficon-image', bold: true, value: 'Container Image Compliance' }, 'OpenSCAP',
      ],
      title: 'View this Container Image Policy',
      onclick: { url: '/miq_policy/show/1' },
    },
    {
      cells: [
        { icon: 'pficon pficon-image', bold: true, value: 'Container Image Control' }, 'My scan',
      ],
      title: 'View this Container Image Policy',
      onclick: { url: '/miq_policy/show/2' },
    },
    {
      cells: [
        { icon: 'pficon pficon-image', bold: true, value: 'Container Image Control' }, 'Schedule compliance',
      ],
      title: 'View this Container Image Policy',
      onclick: { url: '/miq_policy/show/3' },
    },
    {
      cells: [
        { icon: 'pficon pficon-container-node', bold: true, value: 'Container Node Control' }, 'loic Node',
      ],
      title: 'View this Container Node Policy',
      onclick: { url: '/miq_policy/show/4' },
    },
    {
      cells: [
        { icon: 'pficon pficon-virtual-machine', bold: true, value: 'VM and Instance Control' }, 'OpenStack Application',
      ],
      title: 'View this VM and Instance Policy',
      onclick: { url: '/miq_policy/show/5' },
    },
  ],
};

export const policySetNotesData = {
  title: _('Notes'),
  mode: 'miq_policy_set_notes',
  message: 'No notes have been entered.',
  items: [
    {
      value: {
        input: 'text_area', text: 'text area description', readonly: true, rows: 4,
      },
    },
  ],
};
