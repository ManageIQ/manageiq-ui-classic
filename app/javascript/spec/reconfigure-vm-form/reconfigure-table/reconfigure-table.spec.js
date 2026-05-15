import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReconfigureTable from '../../../components/reconfigure-vm-form/reconfigure-table';
import {
  diskHeaders,
  diskRows,
  networkHeaders,
  networkRows,
  driveHeaders,
  driveRows,
} from '../datatable-data';

describe('ReconfigureTable', () => {
  it('should render disk table with headers and rows', () => {
    const { container } = render(
      <ReconfigureTable headers={diskHeaders} rows={diskRows} roleAllowed />
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(diskHeaders.length);
    headers.forEach((header, index) => {
      expect(header).toHaveTextContent(diskHeaders[index].header);
    });

    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(diskRows.length);
    diskRows.forEach((row, index) => {
      expect(rows[index]).toHaveTextContent(row.name);
      expect(rows[index]).toHaveTextContent(row.type);
      expect(rows[index]).toHaveTextContent(row.size);
      expect(rows[index]).toHaveTextContent(row.unit);
    });
  });

  it('should render network table with headers and rows', () => {
    const { container } = render(
      <ReconfigureTable
        headers={networkHeaders}
        rows={networkRows}
        roleAllowed
      />
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(networkHeaders.length);
    headers.forEach((header, index) => {
      expect(header).toHaveTextContent(networkHeaders[index].header);
    });

    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(networkRows.length);
    networkRows.forEach((row, index) => {
      expect(rows[index]).toHaveTextContent(row.name);
      expect(rows[index]).toHaveTextContent(row.mac);
      expect(rows[index]).toHaveTextContent(row.vlan);
    });
  });

  it('should render drive table with headers and rows', () => {
    const { container } = render(
      <ReconfigureTable headers={driveHeaders} rows={driveRows} roleAllowed />
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(driveHeaders.length);
    headers.forEach((header, index) => {
      expect(header).toHaveTextContent(driveHeaders[index].header);
    });

    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(driveRows.length);
    driveRows.forEach((row, index) => {
      expect(rows[index]).toHaveTextContent(row.name);
      expect(rows[index]).toHaveTextContent(row.hostFile);
    });
  });

  it('should call onCellClick when a cell is clicked', async() => {
    const onCellClick = jest.fn();
    const user = userEvent.setup();

    render(
      <ReconfigureTable
        headers={diskHeaders}
        rows={diskRows}
        onCellClick={onCellClick}
        roleAllowed
      />
    );
    const firstCell = screen.getAllByRole('cell')[0];
    await user.click(firstCell);
    expect(onCellClick).toHaveBeenCalled();
  });
});
