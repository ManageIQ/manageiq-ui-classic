import { headerData, rowData } from '../miq-data-table/helper';
import { toHumanSize } from '../../helpers/size';

const diskDisplayName = ({ device_type: deviceType, controller_type: controllerType, location }) => {
  switch (deviceType) {
    case 'cdrom-raw': return sprintf(__('CD-ROM (IDE %s)'), location);
    case 'atapi-cdrom': return sprintf(__('ATAPI CD-ROM (IDE %s)'), location);
    case 'cdrom-image': return sprintf(__('CD-ROM Image (IDE %s)'), location);
    case 'ide': return sprintf(__('Hard Disk (IDE %s)'), location);
    case 'scsi':
    case 'scsi-hardDisk': return sprintf(__('Hard Disk (SCSI %s)'), location);
    case 'scsi-passthru': return sprintf(__('Generic SCSI (%s)'), location);
    case 'floppy': return sprintf(__('Floppy Drive (SIO %s)'), location);
    case 'disk':
      if (controllerType?.startsWith('ide')) {
        return sprintf(__('Hard Disk (IDE %s)'), location);
      }
      if (controllerType?.startsWith('scsi')) {
        return sprintf(__('Hard Disk (SCSI %s)'), location);
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
      { text: disk.size ? toHumanSize(disk.size) : '' },
      { text: disk.size_on_disk ? toHumanSize(disk.size_on_disk) : '' },
      { text: (disk.size && disk.size_on_disk) ? ((disk.size_on_disk / disk.size) * 100).toFixed(1) : '0.0' },
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
