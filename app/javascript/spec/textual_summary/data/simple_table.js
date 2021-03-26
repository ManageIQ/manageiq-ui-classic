export const simpleTableData = {
  labels: ['Network Protocol', 'Host Protocol', 'Direction', 'Port', 'End Port', 'Source'],
  rows: [
    [null, '-1', 'outbound', 0, 0, '0.0.0.0/0'],
    [null, 'TCP', 'inbound', 22, 22, '0.0.0.0/0'],
    [null, {value: ['TCP'], link: 'some_link'}, 'inbound', 80, 80, '0.0.0.0/0'],
  ],
  title: 'Firewall Rules',
};
