import { render, screen } from '@testing-library/react';
import UtilizationReport from '../../components/utilization/utilization-report';

const summaryData = {
  info: [
    ['Utilization Trend Summary for', 'Enterprise'],
    ['Trend Interval', '06/11/2024 - 06/17/2024'],
    ['Selected Day', '06/17/2024'],
  ],
  cpu: [
    ['CPU Total', '3.2 GHz', 'total'],
    ['CPU Available', '1.2 GHz', 'available'],
    ['Trend: Max', '2.8 GHz', 'trend_max'],
  ],
  memory: [
    ['Memory Total', '16 GB', 'total'],
  ],
};

describe('UtilizationReport', () => {
  it('shows no-node-selected message when hasTrendData is false and noNodeSelected is true', () => {
    const { container } = render(
      <UtilizationReport hasTrendData={false} noNodeSelected />
    );

    expect(screen.getByText('Select a node on the left to view Utilization report.')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('shows no-data message when hasTrendData is false and a node is selected', () => {
    const { container } = render(
      <UtilizationReport hasTrendData={false} noNodeSelected={false} />
    );

    expect(screen.getByText('No performance data is available for the selected item.')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('renders basic info, all data table rows, and the trend footer', () => {
    render(
      <UtilizationReport
        hasTrendData
        summary={summaryData}
        trendStart="06/11/2024"
        trendEnd="06/17/2024"
        timezone="UTC"
      />
    );

    // Basic Information structured list
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Utilization Trend Summary for')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();

    // All CPU rows shown (no filter in report tab)
    expect(screen.getByText('CPU Total')).toBeInTheDocument();
    expect(screen.getByText('CPU Available')).toBeInTheDocument();
    expect(screen.getByText('Trend: Max')).toBeInTheDocument();

    // Memory section
    expect(screen.getByText('Memory Total')).toBeInTheDocument();

    // Trend footer
    expect(screen.getAllByText(/06\/11\/2024/).length).toBeGreaterThan(0);
    expect(screen.getByText(/UTC/)).toBeInTheDocument();
  });

  it('renders summary passed as a JSON string', () => {
    render(
      <UtilizationReport
        hasTrendData
        summary={JSON.stringify(summaryData)}
      />
    );

    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    expect(screen.getByText('CPU Total')).toBeInTheDocument();
  });

  it('renders without a basic info section when info is empty', () => {
    const { cpu } = summaryData;
    render(
      <UtilizationReport
        hasTrendData
        summary={{ cpu }}
      />
    );

    expect(screen.queryByText('Basic Information')).not.toBeInTheDocument();
    expect(screen.getByText('CPU Total')).toBeInTheDocument();
  });
});
