import { ProvGridTypes } from '../../components/prov-grid/helper';

const vmHeaders = [[__('Name'), 'name'],
  [__('Operating System'), 'operating_system.product_name'],
  [__('Platform'), 'platform'],
  [__('CPUs'), 'cpu_total_cores'],
  [__('Memory'), 'mem_cpu'],
  [__('Disk Size'), 'allocated_disk_storage'],
  [__('Provider'), 'ext_management_system.name'],
  [__('Snapshots'), 'v_total_snapshots']];

const hostHeaders = [[__('Name'), 'name'],
  [__('Total VMs'), 'v_total_vms'],
  [__('Platform'), 'vmm_product'],
  [__('Version'), 'vmm_version'],
  [__('State'), 'state'],
  [__('Maintenance'), 'maintenance'],
];

const dsHeaders = [[__('Name'), 'name'],
  [__('Free Space'), 'free_space'],
  [__('Total Space'), 'total_space'],
  [__('Storage Clusters'), 'storage_clusters'],
];

const isoImgHeaders = [[__('Name'), 'name']];

const pxeImgHeaders = [[__('Name'), 'name'],
  [__('Description'), 'description'],
];

const templateHeaders = [[__('Name'), 'name'],
  [__('Description'), 'description'],
  [__('Last Updated'), 'last_updated'],
];

const sortData = (index) => {
  if (index === 0) {
    return { isFilteredBy: true, sortDirection: 'ASC' };
  }
  return { isFilteredBy: false };
};

const headerData = (type) => {
  switch (type) {
    case ProvGridTypes.vm:
      return vmHeaders;
    case ProvGridTypes.host:
      return hostHeaders;
    case ProvGridTypes.ds:
      return dsHeaders;
    case ProvGridTypes.isoImg:
      return isoImgHeaders;
    case ProvGridTypes.pxeImg:
      return pxeImgHeaders;
    case ProvGridTypes.template:
      return templateHeaders;
    default:
      return [];
  }
};

const provGridHeaders = (type) => headerData(type).map((item, index) => (
  {
    text: item[0],
    header_text: item[0],
    sort_choice: item[1],
    sort_data: sortData(index),
  }
));

const rowData = (headers, _type) => {
  const rows = [];
  const cells = [...Array(headers.length)].map((_item, index) => ({ text: `cell_text_${index}` }));
  [...Array(10)].forEach((_item, index) => rows.push({ id: index.toString(), clickable: true, cells }));
  return rows;
};

const provGridList = (type) => {
  const headers = provGridHeaders(type);
  return {
    headers, rows: rowData(headers, type),
  };
};

export const provGridData = (data) => {
  const gridList = provGridList(data.type);
  return {
    headers: gridList.headers,
    rows: gridList.rows,
    selected: '5',
    recordId: 21,
    fieldId: data.fieldId,
    field: data.fieldId,
    type: data.type,
    spec: true,
  };
};
