import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DriftHistory from '../../components/drift-history/index';

describe('DriftHistory component', () => {
  const mockTimestamps = [
    { formatted: '2024-01-01 10:00:00', relative: '2 days ago' },
    { formatted: '2024-01-02 11:00:00', relative: '1 day ago' },
    { formatted: '2024-01-03 12:00:00', relative: '5 hours ago' },
  ];

  beforeEach(() => {
    window.miqUpdateButtons = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render warning notification when timestamps array is empty', () => {
    render(<DriftHistory timestamps={[]} />);

    expect(screen.getByText('No drift history found')).toBeInTheDocument();
  });

  it('should parse JSON string timestamps', () => {
    const jsonString = JSON.stringify(mockTimestamps);
    render(<DriftHistory timestamps={jsonString} />);

    expect(screen.getByText('2024-01-03 12:00:00 (5 hours ago)')).toBeInTheDocument();
  });

  it('should display timestamps in reverse order (newest first)', () => {
    render(<DriftHistory timestamps={mockTimestamps} />);

    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    const lastDataRow = rows[rows.length - 1];

    expect(firstDataRow).toHaveTextContent('2024-01-03 12:00:00 (5 hours ago)');
    expect(lastDataRow).toHaveTextContent('2024-01-01 10:00:00 (2 days ago)');
  });

  it('should map reversed display indices to original array indices correctly', () => {
    render(<DriftHistory timestamps={mockTimestamps} />);

    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    const thirdDataRow = rows[3];

    const firstCheckbox = firstDataRow.querySelector('input[type="checkbox"]');
    expect(firstCheckbox).toHaveAttribute('id', 'check_2');

    const thirdCheckbox = thirdDataRow.querySelector('input[type="checkbox"]');
    expect(thirdCheckbox).toHaveAttribute('id', 'check_0');
  });

  it('should check and uncheck checkbox when clicked', () => {
    render(<DriftHistory timestamps={mockTimestamps} />);

    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];

    expect(firstCheckbox).not.toBeChecked();

    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();

    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).not.toBeChecked();
  });

  it('should call window.miqUpdateButtons when checkbox is changed', () => {
    render(<DriftHistory timestamps={mockTimestamps} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(window.miqUpdateButtons).toHaveBeenCalledWith(
      expect.any(Object),
      'center_tb'
    );
  });
});
