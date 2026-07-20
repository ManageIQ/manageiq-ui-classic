import { render, screen } from '@testing-library/react';
import VmRightSizePrint from '../../components/vm-right-size/VmRightSizePrint';

const mockData = {
  cpu_total_cores: '4',
  mem_cpu: '8192 MB',
  cpu_minimum: '1',
  mem_minimum: '1 GB',
  norm: {
    cpu_mhz_max: '2.40 GHz',
    cpu_mhz_high: '2.00 GHz',
    cpu_mhz_avg: '1.20 GHz',
    cpu_mhz_low: '400 MHz',
    cpu_pct_max: '80.00%',
    cpu_pct_high: '65.00%',
    cpu_pct_avg: '40.00%',
    cpu_pct_low: '10.00%',
    mem_max: '6 GB',
    mem_high: '5 GB',
    mem_avg: '4 GB',
    mem_low: '1 GB',
    mem_pct_max: '75.00%',
    mem_pct_high: '62.50%',
    mem_pct_avg: '50.00%',
    mem_pct_low: '12.50%',
  },
  conservative: {
    recommended_vcpus: '4',
    vcpus_change_pct: '0.00%',
    vcpus_change: '0',
    recommended_mem: '8192 MB',
    mem_change_pct: '0.00%',
    mem_change: '0 MB',
  },
  moderate: {
    recommended_vcpus: '3',
    vcpus_change_pct: '-25.00%',
    vcpus_change: '-1',
    recommended_mem: '6144 MB',
    mem_change_pct: '-25.00%',
    mem_change: '-2048 MB',
  },
  aggressive: {
    recommended_vcpus: '2',
    vcpus_change_pct: '-50.00%',
    vcpus_change: '-2',
    recommended_mem: '4096 MB',
    mem_change_pct: '-50.00%',
    mem_change: '-4096 MB',
  },
};

describe('VmRightSizePrint', () => {
  it('renders all four section headings', () => {
    render(<VmRightSizePrint data={mockData} />);
    expect(screen.getByText(/Normal Operating Ranges/i)).toBeInTheDocument();
    expect(screen.getByText(/Conservative/i)).toBeInTheDocument();
    expect(screen.getByText(/Moderate/i)).toBeInTheDocument();
    expect(screen.getByText(/Aggressive/i)).toBeInTheDocument();
  });

  it('renders NORM table with correct headers', () => {
    render(<VmRightSizePrint data={mockData} />);
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Average')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('renders NORM table data values', () => {
    render(<VmRightSizePrint data={mockData} />);
    expect(screen.getByText('2.40 GHz')).toBeInTheDocument();
    expect(screen.getByText('6 GB')).toBeInTheDocument();
    expect(screen.getByText('75.00%')).toBeInTheDocument();
  });

  it('renders sizing tables with current cores and memory', () => {
    render(<VmRightSizePrint data={mockData} />);
    expect(screen.getAllByText('4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('8192 MB').length).toBeGreaterThan(0);
  });

  it('renders sizing table recommended values', () => {
    render(<VmRightSizePrint data={mockData} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getAllByText('-50.00%').length).toBeGreaterThan(0);
  });

  it('renders Not Available for missing norm values', () => {
    const sparse = {
      ...mockData,
      norm: { ...mockData.norm, cpu_mhz_max: null },
    };
    render(<VmRightSizePrint data={sparse} />);
    expect(screen.getAllByText('Not Available').length).toBeGreaterThan(0);
  });

  it('renders the minimum note', () => {
    render(<VmRightSizePrint data={mockData} />);
    expect(screen.getByText(/Recommendations are subject to minimum/i)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<VmRightSizePrint data={mockData} />);
    expect(container).toMatchSnapshot();
  });
});
