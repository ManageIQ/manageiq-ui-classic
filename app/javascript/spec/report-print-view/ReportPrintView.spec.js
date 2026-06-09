import { render, screen } from '@testing-library/react';
import ReportPrintView from '../../components/report-print-view';

describe('ReportPrintView', () => {
  const mockReport = {
    headers: ['Name', 'Status', 'Date'],
    col_order: [0, 1, 2],
    title: 'Test Report',
  };

  const mockData = [
    { 'col-0': 'Item 1', 'col-1': 'Active', 'col-2': '2024-01-01' },
    { 'col-0': 'Item 2', 'col-1': 'Inactive', 'col-2': '2024-01-02' },
    { 'col-0': 'Item 3', 'col-1': 'Pending', 'col-2': '2024-01-03' },
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
