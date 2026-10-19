import { render } from '@testing-library/react';
import VmConfig from '../../components/vm-config';

describe('VmConfig', () => {
  // ── devices ────────────────────────────────────────────────────────────────
  // Shape: [{ title: 'Devices', rows: [{ label, value, icon }] }]
  describe('devices display', () => {
    const sections = [
      {
        title: 'Devices',
        rows: [
          { label: 'Hard Disk (SCSI 0:0)', value: '40 GB', icon: 'carbon--storage-pool' },
          { label: 'CD-ROM (IDE 0:0)', value: '', icon: 'carbon--software-resource' },
          { label: 'Floppy Drive (SIO 0:0)', value: '', icon: 'carbon--save' },
        ],
      },
    ];

    it('renders the Devices section', () => {
      const { container } = render(<VmConfig sections={sections} />);
      expect(container).toMatchSnapshot();
    });

    it('renders every device row label and value', () => {
      const { getByText } = render(<VmConfig sections={sections} />);
      expect(getByText('Hard Disk (SCSI 0:0)')).toBeInTheDocument();
      expect(getByText('40 GB')).toBeInTheDocument();
      expect(getByText('CD-ROM (IDE 0:0)')).toBeInTheDocument();
      expect(getByText('Floppy Drive (SIO 0:0)')).toBeInTheDocument();
    });
  });

  // ── os_info ─────────────────────────────────────────────────────────────────
  // Shape: up to two sections — 'Basic Information' (image rows) and optionally
  //        'Account Policies' (label/value rows, absent on Linux)
  describe('os_info display', () => {
    const windowsSections = [
      {
        title: 'Basic Information',
        rows: [
          { label: 'OS Type', value: 'Windows Server 2019', image: '/images/svg/os-windows.svg' },
          { label: 'Version', value: '10.0', image: '/images/svg/os-windows.svg' },
        ],
      },
      {
        title: 'Account Policies',
        rows: [
          { label: 'Min Password Length', value: '8' },
          { label: 'Max Password Age', value: '90' },
        ],
      },
    ];

    const linuxSections = [
      {
        title: 'Basic Information',
        rows: [
          { label: 'OS Type', value: 'Red Hat Enterprise Linux', image: '/images/svg/os-linux.svg' },
        ],
      },
    ];

    it('renders Basic Information and Account Policies for a Windows VM', () => {
      const { container } = render(<VmConfig sections={windowsSections} />);
      expect(container).toMatchSnapshot();
    });

    it('renders Basic Information with image rows', () => {
      const { getByText } = render(<VmConfig sections={windowsSections} />);
      expect(getByText('Basic Information')).toBeInTheDocument();
      expect(getByText('Windows Server 2019')).toBeInTheDocument();
    });

    it('renders Account Policies rows for a Windows VM', () => {
      const { getByText } = render(<VmConfig sections={windowsSections} />);
      expect(getByText('Account Policies')).toBeInTheDocument();
      expect(getByText('Min Password Length')).toBeInTheDocument();
      expect(getByText('8')).toBeInTheDocument();
    });

    it('renders only Basic Information for a Linux VM (no Account Policies)', () => {
      const { container, queryByText } = render(<VmConfig sections={linuxSections} />);
      expect(container).toMatchSnapshot();
      expect(queryByText('Account Policies')).not.toBeInTheDocument();
    });

    it('renders the Linux OS row label and value', () => {
      const { getByText } = render(<VmConfig sections={linuxSections} />);
      expect(getByText('OS Type')).toBeInTheDocument();
      expect(getByText('Red Hat Enterprise Linux')).toBeInTheDocument();
    });
  });

  // ── hv_info ─────────────────────────────────────────────────────────────────
  // Shape: up to two sections — 'Basic Information' (vmm rows) and 'Devices'
  describe('hv_info display', () => {
    const sections = [
      {
        title: 'Basic Information',
        rows: [
          { label: 'Type', value: 'VMware ESXi' },
          { label: 'Version', value: '7.0.3' },
        ],
      },
      {
        title: 'Devices',
        rows: [
          { label: 'Hard Disk (SCSI 0:0)', value: '100 GB', icon: 'carbon--storage-pool' },
        ],
      },
    ];

    it('renders Basic Information and Devices sections', () => {
      const { container } = render(<VmConfig sections={sections} />);
      expect(container).toMatchSnapshot();
    });

    it('renders hypervisor Basic Information rows', () => {
      const { getByText } = render(<VmConfig sections={sections} />);
      expect(getByText('Type')).toBeInTheDocument();
      expect(getByText('VMware ESXi')).toBeInTheDocument();
      expect(getByText('Version')).toBeInTheDocument();
      expect(getByText('7.0.3')).toBeInTheDocument();
    });

    it('renders the Devices section within hv_info', () => {
      const { getAllByText, getByText } = render(<VmConfig sections={sections} />);
      expect(getAllByText('Devices').length).toBeGreaterThan(0);
      expect(getByText('Hard Disk (SCSI 0:0)')).toBeInTheDocument();
    });
  });

  // ── networks ────────────────────────────────────────────────────────────────
  // Shape: one section per adapter — title 'Network Adapter', rows are the 8
  //        fixed network fields (IP Address … DNS Server)
  describe('networks display', () => {
    const sections = [
      {
        title: 'Network Adapter',
        rows: [
          { label: 'IP Address', value: '192.168.1.50' },
          { label: 'IPv6 Address', value: '' },
          { label: 'Description', value: 'vmxnet3' },
          { label: 'DHCP Server', value: '' },
          { label: 'DHCP Enabled', value: 'false' },
          { label: 'Default Gateway', value: '192.168.1.1' },
          { label: 'Subnet Mask', value: '255.255.255.0' },
          { label: 'DNS Server', value: '8.8.8.8' },
        ],
      },
      {
        title: 'Network Adapter',
        rows: [
          { label: 'IP Address', value: '10.0.0.5' },
          { label: 'IPv6 Address', value: 'fe80::1' },
          { label: 'Description', value: 'e1000' },
          { label: 'DHCP Server', value: '10.0.0.1' },
          { label: 'DHCP Enabled', value: 'true' },
          { label: 'Default Gateway', value: '10.0.0.1' },
          { label: 'Subnet Mask', value: '255.255.255.0' },
          { label: 'DNS Server', value: '10.0.0.2' },
        ],
      },
    ];

    it('renders one section per network adapter', () => {
      const { container } = render(<VmConfig sections={sections} />);
      expect(container).toMatchSnapshot();
    });

    it('renders all 8 network field labels for each adapter', () => {
      const { getAllByText } = render(<VmConfig sections={sections} />);
      // Each label appears once per adapter (2 adapters → 2 occurrences)
      expect(getAllByText('IP Address')).toHaveLength(2);
      expect(getAllByText('DNS Server')).toHaveLength(2);
      expect(getAllByText('DHCP Enabled')).toHaveLength(2);
    });

    it('renders the correct IP addresses for each adapter', () => {
      const { getByText } = render(<VmConfig sections={sections} />);
      expect(getByText('192.168.1.50')).toBeInTheDocument();
      expect(getByText('10.0.0.5')).toBeInTheDocument();
    });
  });

  // ── resources_info ──────────────────────────────────────────────────────────
  // Shape: [{ title: 'Resources', rows: [{ label, value }] }] — 10 fixed rows
  describe('resources_info display', () => {
    const sections = [
      {
        title: 'Resources',
        rows: [
          { label: 'CPU Limit', value: '2000' },
          { label: 'CPU Reserve', value: '500' },
          { label: 'CPU Reserve Expand', value: 'false' },
          { label: 'CPU Shares', value: '2000' },
          { label: 'CPU Shares Level', value: 'normal' },
          { label: 'Memory Limit', value: '4096' },
          { label: 'Memory Reserve', value: '1024' },
          { label: 'Memory Reserve Expand', value: 'false' },
          { label: 'Memory Shares', value: '40960' },
          { label: 'Memory Shares Level', value: 'normal' },
        ],
      },
    ];

    it('renders the Resources section', () => {
      const { container } = render(<VmConfig sections={sections} />);
      expect(container).toMatchSnapshot();
    });

    it('renders all 10 resource row labels', () => {
      const { getByText } = render(<VmConfig sections={sections} />);
      expect(getByText('CPU Limit')).toBeInTheDocument();
      expect(getByText('CPU Reserve')).toBeInTheDocument();
      expect(getByText('CPU Reserve Expand')).toBeInTheDocument();
      expect(getByText('CPU Shares')).toBeInTheDocument();
      expect(getByText('CPU Shares Level')).toBeInTheDocument();
      expect(getByText('Memory Limit')).toBeInTheDocument();
      expect(getByText('Memory Reserve')).toBeInTheDocument();
      expect(getByText('Memory Reserve Expand')).toBeInTheDocument();
      expect(getByText('Memory Shares')).toBeInTheDocument();
      expect(getByText('Memory Shares Level')).toBeInTheDocument();
    });

    it('renders the resource values', () => {
      const { getAllByText, getByText } = render(<VmConfig sections={sections} />);
      // '2000' appears for both CPU Limit and CPU Shares
      expect(getAllByText('2000')).toHaveLength(2);
      expect(getByText('4096')).toBeInTheDocument();
      // 'normal' appears for both CPU Shares Level and Memory Shares Level
      expect(getAllByText('normal')).toHaveLength(2);
    });
  });
});
