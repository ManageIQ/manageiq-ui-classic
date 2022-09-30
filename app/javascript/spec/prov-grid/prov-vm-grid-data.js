const headers = [[__('Name'), 'name'],
  [__('Operating System'), 'operating_system.product_name'],
  [__('Platform'), 'platform'],
  [__('CPUs'), 'cpu_total_cores'],
  [__('Memory'), 'mem_cpu'],
  [__('Disk Size'), 'allocated_disk_storage'],
  [__('Provider'), 'ext_management_system.name'],
  [__('Snapshots'), 'v_total_snapshots']];

const sortData = (index) => {
  if (index === 0) {
    return { isFilteredBy: true, sortDirection: 'ASC' };
  }
  return { isFilteredBy: false };
};

const headerData = () => headers.map((item, index) => (
  {
    text: item[0],
    header_text: item[0],
    sort_choice: item[1],
    sort_data: sortData(index),
  }
));

const rowData = () => {
  const rows = [];
  const cells = [...Array(headers.length)].map((_item, index) => ({ text: `cell_text_${index}` }));
  [...Array(10)].forEach((_item, index) => rows.push({ id: index.toString(), clickable: true, cells }));
  return rows;
};

export const provVmGridData = () => {
  const initialData = {
    headers: headerData(),
    rows: rowData(),
    selected: '5',
    recordId: 21,
  };
  return { fieldId: 'service__src_vm_id', initialData };
};
