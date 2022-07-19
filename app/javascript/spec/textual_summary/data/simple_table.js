export const simpleTableData = {
  labels: ['Network Protocol', 'Host Protocol', 'Direction', 'Port', 'End Port', 'Source'],
  rows: [
    [null, '-1', 'outbound', 0, 0, '0.0.0.0/0'],
    [null, 'TCP', 'inbound', 22, 22, '0.0.0.0/0'],
    [null, { value: ['TCP'], link: 'some_link' }, 'inbound', 80, 80, '0.0.0.0/0'],
  ],
  title: 'Firewall Rules',
};

export const buildInstance = {
  title: 'Build Instances',
  labels: [
    'Name',
    'Phase',
    'Message',
    'Reason',
    'Pod',
    'Output Image',
    'Start Timestamp',
    { value: 'Completion Timestamp', sortable: 'desc' },
    'Duration',
  ],
  items: [
    [
      'cart-1',
      'Complete',
      { value: null, expandable: true },
      null,
      'No Pod',
      { value: 'docker-registry.default.svc:5000/coolstore/cart:latest', expandable: true },
      '2018-01-13T23:53:59Z',
      '2018-01-13T23:57:57Z',
      '3m58s',
    ],
  ],
};
