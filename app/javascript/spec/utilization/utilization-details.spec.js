import { render, screen } from '@testing-library/react';
import UtilizationDetails from '../../components/utilization/utilization-details';

describe('UtilizationDetails', () => {
  it('shows no-node-selected message when hasTrendData is false and noNodeSelected is true', () => {
    const { container } = render(
      <UtilizationDetails hasTrendData={false} noNodeSelected />
    );

    expect(screen.getByText('Select a node on the left to view Utilization information.')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('shows no-data message when hasTrendData is false and a node is selected', () => {
    const { container } = render(
      <UtilizationDetails hasTrendData={false} noNodeSelected={false} />
    );

    expect(screen.getByText('No performance data is available for the selected item.')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('renders the trend date footer when hasTrendData is true', () => {
    render(
      <UtilizationDetails
        hasTrendData
        trendStart="06/11/2024"
        trendEnd="06/17/2024"
        timezone="UTC"
      />
    );

    expect(screen.getByText(/06\/11\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/06\/17\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/UTC/)).toBeInTheDocument();
  });
});
