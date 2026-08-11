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

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('handles empty data', () => {
    render(<ReportPrintView report={mockReport} data={[]} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  describe('grouped report', () => {
    const groupedReport = {
      headers: ['Name', 'Status'],
      col_order: ['name', 'status'],
      title: 'Grouped Report',
      group: 'c',
      sortby: ['status'],
    };

    const groupedData = [
      ['Item 1', 'Active'],
      ['Item 2', 'Active'],
      ['Item 3', 'Inactive'],
    ];

    it('renders one table per group', () => {
      render(<ReportPrintView report={groupedReport} data={groupedData} />);

      expect(screen.getAllByRole('table')).toHaveLength(2);
    });

    it('renders label and count in each table footer', () => {
      render(<ReportPrintView report={groupedReport} data={groupedData} />);

      expect(screen.getByText('Active | Count: 2')).toBeInTheDocument();
      expect(screen.getByText('Inactive | Count: 1')).toBeInTheDocument();
    });

    it('renders all row data within correct groups', () => {
      render(<ReportPrintView report={groupedReport} data={groupedData} />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });
});
