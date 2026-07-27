import { headerData, rowData } from '../miq-data-table/helper';
import { toHumanSize } from '../workers-form/helpers';

const numberToHumanSize = (bytes) => {
  const human = toHumanSize(bytes);
  if (!human) {
    return '';
  }
  return human.replace(/^[\d.]+/, (n) => Math.round(parseFloat(n)));
};

const diskDisplayName = ({ device_type: deviceType, controller_type: controllerType, location }) => {
  switch (deviceType) {
    case 'cdrom-raw':     return `CD-ROM (IDE ${location})`;
    case 'atapi-cdrom':   return `ATAPI CD-ROM (IDE ${location})`;
    case 'cdrom-image':   return `CD-ROM Image (IDE ${location})`;
    case 'ide':           return `Hard Disk (IDE ${location})`;
    case 'scsi':
    case 'scsi-hardDisk': return `Hard Disk (SCSI ${location})`;
    case 'scsi-passthru': return `Generic SCSI (${location})`;
    case 'floppy':        return `Floppy Drive (SIO ${location})`;
    case 'disk':
      if (controllerType && controllerType.startsWith('ide')) {
        return `Hard Disk (IDE ${location})`;
      }
      if (controllerType && controllerType.startsWith('scsi')) {
        return `Hard Disk (SCSI ${location})`;
      }
      return `${controllerType} ${location}`;
    default: return `${controllerType} ${location}`;
  }
};

export const tableData = (disks) => {
  const initialData = disks.map((disk, index) => ({
    id: `disk-${index}`,
    clickable: false,
    cells: [
      { text: diskDisplayName(disk) },
      { text: disk.disk_type || '' },
      { text: disk.mode || '' },
      { text: disk.partitions_aligned || __('Unknown') },
      { text: disk.size ? numberToHumanSize(disk.size) : '' },
      { text: disk.size_on_disk ? numberToHumanSize(disk.size_on_disk) : '' },
      { text: (disk.size && disk.size_on_disk) ? ((disk.size_on_disk / disk.size) * 100).toFixed(1) : '' },
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
