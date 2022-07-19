import { headerData, rowData } from '../../components/miq-data-table/helper';
import { tableData as chargebackTableData } from '../../components/data-tables/chargeback-rate/helper';

/** Table with text data. */
export const simpleData = () => {
  const miqHeaders = [
    {
      key: 'name',
      header: 'Name',
    },
    {
      key: 'status',
      header: 'Status',
    },
  ];
  const miqRows = [
    {
      id: 'a',
      name: 'Load balancer 1',
      status: 'Disabled',
    },
    {
      id: 'b',
      name: 'Load balancer 2',
      status: 'Starting',
    },
    {
      id: 'c',
      name: 'Load balancer 3',
      status: 'Active',
    },
  ];
  return { miqHeaders, miqRows };
};

/** Table with text data. */
export const timeProfileReportsData = () => {
  const miqHeaders = [
    {
      key: 'name',
      header: 'Name',
    },
    {
      key: 'title',
      header: 'Title',
    },
  ];
  const miqRows = [
    {
      id: '0',
      name: { text: 'CPU Wait Time (by VM)', icon: 'fa fa-file-text-o' },
      title: 'CPU Wait/Ready Time (by VM)',
    },
    {
      id: '1',
      name: { text: 'test', icon: 'fa fa-file-text-o' },
      title: 'test',
    },
    {
      id: '2',
      name: { text: 'zReport1', icon: 'fa fa-file-text-o' },
      title: 'zReport1',
    },
  ];
  return { miqHeaders, miqRows };
};

/** Table data with checkboxes and icons. */
export const containerNodesData = () => {
  const columns = [
    { is_narrow: true, header_text: '' },
    {
      text: 'Name', sort: 'str', col_idx: 0, align: 'left', header_text: 'Name',
    },
    {
      text: 'Provider', sort: 'str', col_idx: 1, align: 'left', header_text: 'Provider',
    },
    {
      text: 'Ready', sort: 'str', col_idx: 2, align: 'left', header_text: 'Ready',
    },
    {
      text: 'Operating System', sort: 'str', col_idx: 3, align: 'left', header_text: 'Operating System',
    },
    {
      text: 'Kernel Version', sort: 'str', col_idx: 4, align: 'left', header_text: 'Kernel Version',
    },
    {
      text: 'Runtime Version', sort: 'str', col_idx: 5, align: 'left', header_text: 'Runtime Version',
    },
  ];

  const cells = [
    { is_checkbox: true },
    { text: 'ocp-compute1.cfme2.lab.eng.rdu2.redhat.com' },
    {
      title: 'OCP 3.6 QE1', image: '', icon: 'pficon pficon-container-node', text: 'OCP 3.6 QE1',
    },
    { text: 'True' },
    { text: 'Red Hat Enterprise Linux' },
    { text: '3.10.0-327.el7.x86_64' },
    { text: 'docker://1.12.6' },
  ];

  const rows = [
    {
      id: '9', long_id: '9', cells, clickable: null, tree_id: '-9',
    },
    {
      id: '10', long_id: '10', cells, clickable: null, tree_id: '-10',
    },
    {
      id: '11', long_id: '11', cells, clickable: null, tree_id: '-11',
    },
    {
      id: '12', long_id: '12', cells, clickable: null, tree_id: '-12',
    },
    {
      id: '13', long_id: '13', cells, clickable: null, tree_id: '-13',
    },
    {
      id: '19', long_id: '19', cells, clickable: null, tree_id: '-19',
    },
    {
      id: '20', long_id: '20', cells, clickable: null, tree_id: '-20',
    },
  ];
  const hasCheckbox = true;
  const { headerKeys, headerItems } = headerData(columns, hasCheckbox);
  const miqRows = rowData(headerKeys, rows, hasCheckbox);
  return { headerItems, miqRows: miqRows.rowItems };
};

/** Table data with checkboxes, images and icons. */
export const hostData = () => {
  const columns = [
    { is_narrow: true, header_text: '' },
    {
      text: 'Name', sort: 'str', col_idx: 0, align: 'left', header_text: 'Name',
    },
    {
      text: 'Provider', sort: 'str', col_idx: 1, align: 'left', header_text: 'Provider',
    },
    {
      text: 'Hypervisor Hostname', sort: 'str', col_idx: 2, align: 'left', header_text: 'Hypervisor Hostname',
    },
    {
      text: 'IP Address', sort: 'str', col_idx: 3, align: 'left', header_text: 'IP Address',
    },
    {
      text: 'Cluster', sort: 'str', col_idx: 4, align: 'left', header_text: 'Cluster',
    },
    {
      text: 'Total VMs', sort: 'str', col_idx: 5, align: 'right', header_text: 'Total VMs',
    },
    {
      text: 'Total Templates', sort: 'str', col_idx: 6, align: 'right', header_text: 'Total Templates',
    },
    {
      text: 'Platform', sort: 'str', col_idx: 7, align: 'left', header_text: 'Platform',
    },
    {
      text: 'Power', sort: 'str', col_idx: 8, align: 'left', header_text: 'Power',
    },
    {
      text: 'Compliant', sort: 'str', col_idx: 9, align: 'left', header_text: 'Compliant',
    },
    {
      text: 'Last Analysis Time', sort: 'str', col_idx: 10, align: 'left', header_text: 'Last Analysis Time',
    },
    {
      text: 'Authentication Status', sort: 'str', col_idx: 11, align: 'left', header_text: 'Authentication Status',
    },
  ];

  const cells = [
    { is_checkbox: true },
    { text: '17d6ec2e-0e75-45ab-95a6-642eb41855cd (Controller)' },
    {
      title: 'OpenStack Director',
      image: '/assets/svg/vendor-redhat-6ef2b0c582ea1f2b1279306a1e1c72f55b4f561a0a524816aa1b0ce9325ee065.svg',
      icon: 'pficon pficon-container-node',
      text: 'OpenStack Director',
    },
    { text: 'overcloud-controller-0' },
    { text: '10.9.60.8' },
    { text: 'overcloud-Controller-kw7lgjvt3ncf' },
    { text: '3' },
    { text: '0' },
    { text: 'rhel (No hypervisor, Host Type is Controller)' },
    {
      title: 'unknown', icon: 'pficon pficon-unknown', background: '#336699', text: 'unknown',
    },
    { title: '', text: '' },
    { text: 'Never' },
    { title: 'None', icon: 'pficon pficon-unknown', text: 'None' },
  ];

  const rows = [
    {
      id: '7', long_id: '7', cells, clickable: null, tree_id: 'h-7',
    },
    {
      id: '8', long_id: '8', cells, clickable: null, tree_id: 'h-8',
    },
    {
      id: '9', long_id: '9', cells, clickable: null, tree_id: 'h-9',
    },
    {
      id: '21', long_id: '21', cells, clickable: null, tree_id: 'h-21',
    },
    {
      id: '18', long_id: '18', cells, clickable: null, tree_id: 'h-18',
    },
    {
      id: '17', long_id: '17', cells, clickable: null, tree_id: 'h-17',
    },
    {
      id: '20', long_id: '20', cells, clickable: null, tree_id: 'h-20',
    },
    {
      id: '19', long_id: '19', cells, clickable: null, tree_id: 'h-19',
    },
    {
      id: '16', long_id: '16', cells, clickable: null, tree_id: 'h-16',
    },
    {
      id: '25', long_id: '25', cells, clickable: null, tree_id: 'h-25',
    },
    {
      id: '26', long_id: '26', cells, clickable: null, tree_id: 'h-26',
    },
    {
      id: '27', long_id: '27', cells, clickable: null, tree_id: 'h-27',
    },
    {
      id: '28', long_id: '28', cells, clickable: null, tree_id: 'h-28',
    },
    {
      id: '3', long_id: '3', cells, clickable: null, tree_id: 'h-3',
    },
    {
      id: '24', long_id: '24', cells, clickable: null, tree_id: 'h-24',
    },
    {
      id: '1', long_id: '1', cells, clickable: null, tree_id: 'h-1',
    },
  ];
  const hasCheckbox = true;
  const { headerKeys, headerItems } = headerData(columns, hasCheckbox);
  const miqRows = rowData(headerKeys, rows, hasCheckbox);
  return { headerItems, miqRows: miqRows.rowItems };
};

/** Table data with icons and buttons. */
export const catalogData = () => {
  const columns = [
    { is_narrow: true, header_text: '' },
    {
      text: 'Name', sort: 'str', col_idx: 0, align: 'left', header_text: 'Name',
    },
    {
      text: 'Description', sort: 'str', col_idx: 1, align: 'left', header_text: 'Description',
    },
    {
      text: 'Type', sort: 'str', col_idx: 2, align: 'left', header_text: 'Type',
    },
    {
      text: 'Item Type', sort: 'str', col_idx: 3, align: 'left', header_text: 'Item Type',
    },
    {
      text: 'Display in Catalog', sort: 'str', col_idx: 4, align: 'left', header_text: 'Display in Catalog',
    },
    {
      text: 'Catalog', sort: 'str', col_idx: 5, align: 'left', header_text: 'Catalog',
    },
    {
      text: 'Created On', sort: 'str', col_idx: 6, align: 'left', header_text: 'Created On',
    },
    {
      text: 'Valid', sort: 'str', col_idx: 7, align: 'left', header_text: 'Valid',
    },
    { is_narrow: true, header_text: '' },
  ];

  const cells = [
    { title: 'View this item', image: '', icon: 'fa fa-cube' },
    { text: '1111111' },
    { text: '11 test' },
    { text: 'Item' },
    { text: 'VMware Content Library OVF Template' },
    { text: 'True' },
    { text: 'AWS' },
    { text: '09/30/20 19:31:00 UTC' },
    { text: 'True' },
    {
      alt: 'Order this Service',
      disabled: false,
      is_button: true,
      onclick: 'miqOrderService("141");',
      text: 'Order',
      title: 'Order this Service',
    },
  ];

  const rows = [
    {
      id: '141', long_id: '141', cells, clickable: null, tree_id: 'st-141',
    },
    {
      id: '143', long_id: '143', cells, clickable: null, tree_id: 'st-143',
    },
    {
      id: '139', long_id: '139', cells, clickable: null, tree_id: 'st-139',
    },
    {
      id: '138', long_id: '138', cells, clickable: null, tree_id: 'st-138',
    },
    {
      id: '140', long_id: '140', cells, clickable: null, tree_id: 'st-140',
    },
    {
      id: '54', long_id: '54', cells, clickable: null, tree_id: 'st-54',
    },
    {
      id: '83', long_id: '83', cells, clickable: null, tree_id: 'st-83',
    },
    {
      id: '31', long_id: '31', cells, clickable: null, tree_id: 'st-31',
    },
    {
      id: '46', long_id: '46', cells, clickable: null, tree_id: 'st-46',
    },
    {
      id: '68', long_id: '68', cells, clickable: null, tree_id: 'st-68',
    },
    {
      id: '7', long_id: '7', cells, clickable: null, tree_id: 'st-7',
    },
  ];
  const hasCheckbox = false;
  const { headerKeys, headerItems } = headerData(columns, hasCheckbox);
  const miqRows = rowData(headerKeys, rows, hasCheckbox);
  return { headerItems, miqRows: miqRows.rowItems };
};

/** Table data with multiple rows within a cell, ie 'text' contains an array or a string.
 * Usage eg: Overview / Chargeback / Rates / Item (Summary)
 */
export const chargebackRateData = () => {
  const cells = [
    { text: 'CPU' },
    { text: ['Allocated CPU Count', 'vCPUs Allocated over Time Period'] },
    { text: [0, 100] },
    { text: [100, 'Infinity'] },
    { text: [1.5, 0.5], align: 'right' },
    { text: [0], align: 'right' },
    { text: '€ [Euro] / Hour / Cpu' },
  ];
  const initialData = [
    { id: '0', clickable: false, cells },
    { id: '1', clickable: false, cells },
    { id: '2', clickable: false, cells },
    { id: '3', clickable: false, cells },
    { id: '4', clickable: false, cells },
    { id: '5', clickable: false, cells },
    { id: '6', clickable: false, cells },
    { id: '7', clickable: false, cells },
    { id: '8', clickable: false, cells },
    { id: '9', clickable: false, cells },
  ];

  const { headers, rows } = chargebackTableData(initialData, true);
  return { headers, rows };
};
