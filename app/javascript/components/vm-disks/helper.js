import { headerData, rowData } from '../miq-data-table/helper';

export const tableData = (disks) => {
  const initialData = disks.map((disk, index) => ({
    id: `disk-${index}`,
    clickable: false,
    cells: [
      { text: disk.deviceName || '' },
      { text: disk.diskType || '' },
      { text: disk.mode || '' },
      { text: disk.partitionsAligned || '' },
      { text: disk.size || '' },
      { text: disk.sizeOnDisk || '' },
      { text: disk.usedPercent || '' },
    ],
  }));

  const columns = [
    { text: 'deviceName', header_text: __('Device Type') },
    { text: 'diskType', header_text: __('Type') },
    { text: 'mode', header_text: __('Mode') },
    { text: 'partitionsAligned', header_text: __('Partitions Aligned') },
    { text: 'size', header_text: __('Provisioned Size') },
    { text: 'sizeOnDisk', header_text: __('Used Size') },
    { text: 'usedPercent', header_text: __('Percent Used of Provisioned Size') },
  ];

  const { headerKeys, headerItems: headers } = headerData(columns, false);
  const rows = rowData(headerKeys, initialData, false);

  return { headers, rows };
};
