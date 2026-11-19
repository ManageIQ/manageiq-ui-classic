import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComplianceHistory from '../../components/compliance-history/index';

describe('ComplianceHistory component', () => {
  const singleCheck = [
    {
      id: 1,
      timestamp: '2024-01-01 10:00:00 UTC',
      compliant: true,
      policies: [
        {
          id: 10,
          name: 'Allow only root login',
          result: true,
          conditions: [
            { id: 100, description: 'Root login is disabled', result: true },
          ],
        },
      ],
    },
  ];

  const mockChecks = [
    ...singleCheck,
    {
      id: 2,
      timestamp: '2024-01-02 12:00:00 UTC',
      compliant: false,
      policies: [],
    },
  ];

  it('renders a warning notification when checks array is empty', () => {
    render(<ComplianceHistory checks={[]} />);
    expect(screen.getByText('No compliance history found')).toBeInTheDocument();
  });

  it('renders a warning notification when checks is an empty JSON string', () => {
    render(<ComplianceHistory checks="[]" />);
    expect(screen.getByText('No compliance history found')).toBeInTheDocument();
  });

  it('parses a JSON string of checks', () => {
    render(<ComplianceHistory checks={JSON.stringify(mockChecks)} />);
    expect(screen.getByText('2024-01-01 10:00:00 UTC', { exact: false })).toBeInTheDocument();
  });

  it('renders a tree node for each compliance check', () => {
    render(<ComplianceHistory checks={mockChecks} />);
    expect(screen.getByText('2024-01-01 10:00:00 UTC', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('2024-01-02 12:00:00 UTC', { exact: false })).toBeInTheDocument();
  });

  it('renders "No Compliance Policies Found" for checks with no policies', () => {
    render(<ComplianceHistory checks={mockChecks} />);
    expect(screen.getByText('No Compliance Policies Found')).toBeInTheDocument();
  });

  it('renders policy name under a compliance check', () => {
    render(<ComplianceHistory checks={mockChecks} />);
    expect(screen.getByText('Allow only root login', { exact: false })).toBeInTheDocument();
  });

  it('renders condition description under a policy', () => {
    render(<ComplianceHistory checks={mockChecks} />);
    expect(screen.getByText('Root login is disabled')).toBeInTheDocument();
  });

  describe('auto-expand behaviour', () => {
    it('expands the check node when there is only one check (status page)', () => {
      render(<ComplianceHistory checks={singleCheck} />);
      expect(screen.getByRole('treeitem', { name: /2024-01-01/i })).toHaveAttribute('aria-expanded', 'true');
    });

    it('expands the policy node when there is only one check (status page)', () => {
      render(<ComplianceHistory checks={singleCheck} />);
      expect(document.getElementById('ch-1-p-10')).toHaveAttribute('aria-expanded', 'true');
    });

    it('does not auto-expand check nodes when there are multiple checks (history page)', () => {
      render(<ComplianceHistory checks={mockChecks} />);
      const checkItems = screen.getAllByRole('treeitem', { name: /2024-01-0/i });
      checkItems.forEach((item) => {
        expect(item).not.toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Expand All / Collapse All toolbar', () => {
    it('does not show toolbar on the status page (single check)', () => {
      render(<ComplianceHistory checks={singleCheck} />);
      expect(screen.queryByText('Expand All')).not.toBeInTheDocument();
      expect(screen.queryByText('Collapse All')).not.toBeInTheDocument();
    });

    it('shows a single toggle button labelled "Expand All" on the history page', () => {
      render(<ComplianceHistory checks={mockChecks} />);
      expect(screen.getByText('Expand All')).toBeInTheDocument();
      expect(screen.queryByText('Collapse All')).not.toBeInTheDocument();
    });

    it('expands all check nodes when the toggle button is clicked', () => {
      render(<ComplianceHistory checks={mockChecks} />);
      fireEvent.click(screen.getByText('Expand All'));
      screen.getAllByRole('treeitem', { name: /2024-01-0/i }).forEach((item) => {
        expect(item).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('switches label to "Collapse All" after expanding', () => {
      render(<ComplianceHistory checks={mockChecks} />);
      fireEvent.click(screen.getByText('Expand All'));
      expect(screen.getByText('Collapse All')).toBeInTheDocument();
      expect(screen.queryByText('Expand All')).not.toBeInTheDocument();
    });

    it('collapses all check nodes when the toggle button is clicked again', () => {
      render(<ComplianceHistory checks={mockChecks} />);
      fireEvent.click(screen.getByText('Expand All'));
      fireEvent.click(screen.getByText('Collapse All'));
      screen.getAllByRole('treeitem', { name: /2024-01-0/i }).forEach((item) => {
        expect(item).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });
});
