import { render, screen } from '@testing-library/react';
import UtilizationSummary from '../../components/utilization/utilization-summary';

const summaryData = {
  cpu: [
    ['CPU Total', '3.2 GHz', 'total'],
    ['CPU Available', '1.2 GHz', 'available'],
    ['Trend: Max', '2.8 GHz', 'trend_max'],
    ['Trend: Min', '0.5 GHz', 'trend_min'],
  ],
  memory: [
    ['Memory Total', '16 GB', 'total'],
    ['Trend: Max', '14 GB', 'trend_max'],
  ],
};

describe('UtilizationSummary', () => {
  it('shows no-node-selected message when hasTrendData is false and noNodeSelected is true', () => {
    const { container } = render(
      <UtilizationSummary hasTrendData={false} noNodeSelected />
    );

    expect(screen.getByText('Select a node on the left to view Utilization information.')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('shows no-data message when hasTrendData is false and a node is selected', () => {
    const { container } = render(
      <UtilizationSummary hasTrendData={false} noNodeSelected={false} />
    );

    expect(screen.getByText('No performance data is available for the selected item.')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('renders filtered rows (total and trend_max only) and the trend footer', () => {
    const { container } = render(
      <UtilizationSummary
        hasTrendData
        summary={summaryData}
        trendStart="06/11/2024"
        trendEnd="06/17/2024"
        timezone="UTC"
      />
    );

    expect(screen.getByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('CPU Total')).toBeInTheDocument();
    expect(screen.getAllByText('Trend: Max').length).toBeGreaterThan(0);
    // available row is shown for non-Host models
    expect(screen.getByText('CPU Available')).toBeInTheDocument();
    // trend_min rows are filtered out
    expect(screen.queryByText('Trend: Min')).not.toBeInTheDocument();
    expect(screen.getByText(/06\/11\/2024/)).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('hides available rows when model is Host', () => {
    render(
      <UtilizationSummary
        hasTrendData
        summary={summaryData}
        model="Host"
      />
    );

    expect(screen.queryByText('CPU Available')).not.toBeInTheDocument();
    expect(screen.getByText('CPU Total')).toBeInTheDocument();
  });

  it('renders summary passed as a JSON string', () => {
    render(
      <UtilizationSummary
        hasTrendData
        summary={JSON.stringify(summaryData)}
      />
    );

    expect(screen.getByText('CPU Total')).toBeInTheDocument();
  });
});
