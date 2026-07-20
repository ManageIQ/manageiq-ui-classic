import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import VmRightSize from '../../components/vm-right-size';

const DATA_URL = '/vm_infra/right_size_data?id=1';

const mockData = {
  data: {
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
  },
};

describe('VmRightSize', () => {
  beforeEach(() => {
    fetchMock.get(DATA_URL, mockData);
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('renders a loading spinner initially', () => {
    const { container } = renderWithRedux(<VmRightSize dataUrl={DATA_URL} />);
    expect(container.querySelector('.export-spinner')).toBeInTheDocument();
  });

  it('renders all four sections after data loads', async() => {
    const { getByText } = renderWithRedux(<VmRightSize dataUrl={DATA_URL} />);
    await waitFor(() => {
      expect(getByText(/Normal Operating Ranges/i)).toBeInTheDocument();
    });
    expect(getByText(/Conservative/i)).toBeInTheDocument();
    expect(getByText(/Moderate/i)).toBeInTheDocument();
    expect(getByText(/Aggressive/i)).toBeInTheDocument();
  });

  it('displays CPU and Memory rows in the NORM table', async() => {
    const { getAllByText } = renderWithRedux(<VmRightSize dataUrl={DATA_URL} />);
    await waitFor(() => {
      expect(getAllByText('CPU').length).toBeGreaterThan(0);
    });
    expect(getAllByText('Memory').length).toBeGreaterThan(0);
  });

  it('renders Not Available when a value is missing', async() => {
    fetchMock.reset();
    const sparse = {
      data: { ...mockData.data, norm: { ...mockData.data.norm, cpu_mhz_max: null } },
    };
    const sparseUrl = '/vm_infra/right_size_data?id=2';
    fetchMock.get(sparseUrl, sparse);
    const { getAllByText } = renderWithRedux(<VmRightSize dataUrl={sparseUrl} />);
    await waitFor(() => {
      expect(getAllByText('Not Available').length).toBeGreaterThan(0);
    });
  });

  it('renders a Back button when backUrl is provided', async() => {
    const { getByText } = renderWithRedux(<VmRightSize dataUrl={DATA_URL} backUrl="/some/back/url" />);
    await waitFor(() => {
      expect(getByText('Back')).toBeInTheDocument();
    });
  });

  it('does not render a Back button when backUrl is omitted', async() => {
    const { queryByText } = renderWithRedux(<VmRightSize dataUrl={DATA_URL} />);
    await waitFor(() => {
      expect(queryByText('Back')).not.toBeInTheDocument();
    });
  });

  it('matches snapshot', async() => {
    const { container } = renderWithRedux(<VmRightSize dataUrl={DATA_URL} backUrl="/some/back/url" />);
    await waitFor(() => {
      expect(container.querySelector('#tab_div')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
