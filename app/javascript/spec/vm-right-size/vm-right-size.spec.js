import { renderWithRedux } from '../helpers/mountForm';
import VmRightSize from '../../components/vm-right-size';

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

describe('VmRightSize', () => {
  it('renders all four sections', () => {
    const { getByText } = renderWithRedux(<VmRightSize data={mockData} />);
    expect(getByText(/Normal Operating Ranges/i)).toBeInTheDocument();
    expect(getByText(/Conservative/i)).toBeInTheDocument();
    expect(getByText(/Moderate/i)).toBeInTheDocument();
    expect(getByText(/Aggressive/i)).toBeInTheDocument();
  });

  it('displays CPU and Memory rows in the NORM table', () => {
    const { getAllByText } = renderWithRedux(<VmRightSize data={mockData} />);
    expect(getAllByText('CPU').length).toBeGreaterThan(0);
    expect(getAllByText('Memory').length).toBeGreaterThan(0);
  });

  it('renders Not Available when a value is missing', () => {
    const sparse = {
      ...mockData,
      norm: { ...mockData.norm, cpu_mhz_max: null },
    };
    const { getAllByText } = renderWithRedux(<VmRightSize data={sparse} />);
    expect(getAllByText('Not Available').length).toBeGreaterThan(0);
  });

  it('renders a Back button when backUrl is provided', () => {
    const { getByText } = renderWithRedux(<VmRightSize data={mockData} backUrl="/some/back/url" />);
    expect(getByText('Back')).toBeInTheDocument();
  });

  it('does not render a Back button when backUrl is omitted', () => {
    const { queryByText } = renderWithRedux(<VmRightSize data={mockData} />);
    expect(queryByText('Back')).not.toBeInTheDocument();
  });

  it('renders null when data is not provided', () => {
    const { container } = renderWithRedux(<VmRightSize />);
    expect(container.firstChild).toBeNull();
  });

  it('matches snapshot', () => {
    const { container } = renderWithRedux(<VmRightSize data={mockData} backUrl="/some/back/url" />);
    expect(container).toMatchSnapshot();
  });
});
