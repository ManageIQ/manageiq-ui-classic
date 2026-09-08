import { render, screen, waitFor } from '@testing-library/react';
import VmDisks from '../../components/vm-disks/index';

const mockDisks = [
  {
    device_type: 'disk',
    controller_type: 'scsi',
    location: '0:0',
    disk_type: 'thin',
    mode: 'persistent',
    partitions_aligned: 'True',
    size: 53687091200,        // 50 GB in bytes
    size_on_disk: 10737418240, // 10 GB in bytes
  },
  {
    device_type: 'disk',
    controller_type: 'scsi',
    location: '0:1',
    disk_type: 'thick',
    mode: 'persistent',
    partitions_aligned: 'False',
    size: 107374182400,        // 100 GB in bytes
    size_on_disk: 42949672960, // 40 GB in bytes
  },
];

beforeEach(() => {
  API.get = jest.fn(() => Promise.resolve({ resources: mockDisks }));
});

describe('VmDisks Component', () => {
  it('should render a table when disks are provided', async() => {
    const { container } = render(<VmDisks recordId={3170} />);
    await waitFor(() => screen.getByText('Hard Disk (SCSI 0:0)'));
    expect(container).toMatchSnapshot();
    expect(screen.getByText('Hard Disk (SCSI 0:0)')).toBeInTheDocument();
    expect(screen.getByText('Hard Disk (SCSI 0:1)')).toBeInTheDocument();
  });

  it('should fetch disks from the correct API URL', async() => {
    render(<VmDisks recordId={3170} />);
    await waitFor(() => screen.getByText('Hard Disk (SCSI 0:0)'));
    expect(API.get).toHaveBeenCalledWith('/api/vms/3170/disks?expand=resources&attributes=partitions_aligned');
  });

  it('should fetch disks from the templates API URL when isTemplate is true', async() => {
    render(<VmDisks recordId={3170} isTemplate />);
    await waitFor(() => screen.getByText('Hard Disk (SCSI 0:0)'));
    expect(API.get).toHaveBeenCalledWith('/api/templates/3170/disks?expand=resources&attributes=partitions_aligned');
  });

  it('should render correct number of rows', async() => {
    API.get = jest.fn(() => Promise.resolve({ resources: [mockDisks[0]] }));
    render(<VmDisks recordId={3170} />);
    await waitFor(() => screen.getByText('Hard Disk (SCSI 0:0)'));
    // header row + 1 data row = 2 total
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2);
  });

  it('should build display name from device_type, controller_type and location', async() => {
    render(<VmDisks recordId={3170} />);
    await waitFor(() => screen.getByText('Hard Disk (SCSI 0:0)'));
    expect(screen.getByText('Hard Disk (SCSI 0:0)')).toBeInTheDocument();
  });

  it('should render all column headers', async() => {
    render(<VmDisks recordId={3170} />);
    await waitFor(() => screen.getByText('Device Type'));
    expect(screen.getByText('Device Type')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Mode')).toBeInTheDocument();
    expect(screen.getByText('Partitions Aligned')).toBeInTheDocument();
    expect(screen.getByText('Provisioned Size')).toBeInTheDocument();
    expect(screen.getByText('Used Size')).toBeInTheDocument();
    expect(screen.getByText('Percent Used of Provisioned Size')).toBeInTheDocument();
  });

  it('should render sizes as human readable strings', async() => {
    render(<VmDisks recordId={3170} />);
    await waitFor(() => screen.getByText('Hard Disk (SCSI 0:0)'));
    expect(screen.getByText('50 GB')).toBeInTheDocument();
    expect(screen.getByText('10 GB')).toBeInTheDocument();
  });

  it('should calculate percent used of provisioned size', async() => {
    render(<VmDisks recordId={3170} />);
    await waitFor(() => screen.getByText('Hard Disk (SCSI 0:0)'));
    // 10737418240 / 53687091200 * 100 = 20.0
    expect(screen.getByText('20.0')).toBeInTheDocument();
  });

  it('should show Unknown when partitions_aligned is missing', async() => {
    API.get = jest.fn(() => Promise.resolve({
      resources: [{ ...mockDisks[0], partitions_aligned: null }],
    }));
    render(<VmDisks recordId={3170} />);
    await waitFor(() => screen.getByText('Hard Disk (SCSI 0:0)'));
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
