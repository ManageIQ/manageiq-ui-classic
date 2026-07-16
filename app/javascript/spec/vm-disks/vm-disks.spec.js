import { render, screen } from '@testing-library/react';
import VmDisks from '../../components/vm-disks/index';

describe('VmDisks Component', () => {
  it('should render a table when disks are provided', () => {
    const disks = [
      {
        deviceName: 'Hard Disk (SCSI 0:0)',
        diskType: 'thin',
        mode: 'persistent',
        partitionsAligned: 'True',
        size: '50 GB',
        sizeOnDisk: '10 GB',
        usedPercent: '20%',
      },
      {
        deviceName: 'Hard Disk (SCSI 0:1)',
        diskType: 'thick',
        mode: 'persistent',
        partitionsAligned: 'False',
        size: '100 GB',
        sizeOnDisk: '40 GB',
        usedPercent: '40%',
      },
    ];
    const { container } = render(<VmDisks disks={disks} />);
    expect(container).toMatchSnapshot();
    expect(screen.getByText('Hard Disk (SCSI 0:0)')).toBeInTheDocument();
    expect(screen.getByText('Hard Disk (SCSI 0:1)')).toBeInTheDocument();
  });

  it('should render correct number of rows', () => {
    const disks = [
      {
        deviceName: 'Hard Disk (IDE 0:0)',
        diskType: 'thin',
        mode: 'persistent',
        partitionsAligned: 'True',
        size: '20 GB',
        sizeOnDisk: '5 GB',
        usedPercent: '25%',
      },
    ];
    render(<VmDisks disks={disks} />);
    // header row + 1 data row = 2 total
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2);
  });

  it('should render all column headers', () => {
    render(<VmDisks
      disks={[{
        deviceName: 'Disk', diskType: '', mode: '', partitionsAligned: '', size: '', sizeOnDisk: '', usedPercent: '',
      }]}
    />);
    expect(screen.getByText('Device Type')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Mode')).toBeInTheDocument();
    expect(screen.getByText('Partitions Aligned')).toBeInTheDocument();
    expect(screen.getByText('Provisioned Size')).toBeInTheDocument();
    expect(screen.getByText('Used Size')).toBeInTheDocument();
    expect(screen.getByText('Percent Used of Provisioned Size')).toBeInTheDocument();
  });
});
