export const tagGroupData = {
  items: [
    {
      label: 'Managed by Zone',
      icon: 'pficon pficon-zone',
      value: 'default',
      hoverClass: 'no-hover',
    },
    {
      label: 'My Company X Tags',
      value: [
        { icon: 'fa fa-tag', label: 'Dan Test', value: ['Test 1'] },
        { icon: 'fa fa-tag', label: 'Demo bla', value: ['Policy', '2'] },
      ],
      hoverClass: 'no-hover',
    },
    {
      label: 'Other Tags',
      value: [
        { icon: 'fa fa-tag', label: 'Test', value: ['Test 1'] },
        { icon: 'fa fa-tag', label: 'Demo 2', value: ['Policy', '2', '3'] },
        { value: ['Demo 3'], title: 'Click to display the item', link: 'You clicked on Demo 3' },
      ],
      title: 'All Other Tags',
    },
  ],
  title: 'Smart Management',
};
