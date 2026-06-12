import { render, screen } from '@testing-library/react';
import ReportPrintView from '../../components/report-print-view';

describe('ReportPrintView', () => {
  const mockReport = {
    headers: ['Name', 'Status', 'Date'],
    col_order: ['name', 'status', 'date'],
    title: 'Test Report',
  };

  const mockData = [
    ['Item 1', 'Active', '2024-01-01'],
    ['Item 2', 'Inactive', '2024-01-02'],
    ['Item 3', 'Pending', '2024-01-03'],
  ];

  it('renders table with headers and data', () => {
    render(<ReportPrintView report={mockReport} data={mockData} />);

    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();

    // Check data
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('handles empty data', () => {
    render(<ReportPrintView report={mockReport} data={[]} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
