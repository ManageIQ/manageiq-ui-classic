import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import VmServerRelationShipForm from '../../components/vm-server-relationship-form';
import { renderWithRedux } from '../helpers/mountForm';

describe('Vm server relationship form component', () => {
  const servers = {
    resources: [
      { vm_id: '1', id: '1', name: 'foo' },
      { id: '2', name: 'bar' },
      { id: '3', name: 'baz' },
    ],
  };

  afterEach(() => {
    fetchMock.reset();
  });

  const url = '/api/servers?expand=resources&attributes=id,name,vm_id&sort_by=name&sort_order=desc';

  it('should request data after mount and set to state', async() => {
    fetchMock.getOnce(url, servers);
    renderWithRedux(<VmServerRelationShipForm recordId="2" redirect="" />);

    await waitFor(() => {
      expect(fetchMock.called(url)).toBe(true);
      expect(
        screen.getByRole('combobox', { name: /Server/i })
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('combobox', { name: /Server/i })).toHaveValue('');
  });

  it('should request data after mount and set to state (with serverId)', async() => {
    fetchMock.getOnce(
      '/api/servers?expand=resources&attributes=id,name,vm_id&sort_by=name&sort_order=desc',
      servers
    );

    renderWithRedux(<VmServerRelationShipForm recordId="1" redirect="" />);

    await waitFor(() => {
      expect(fetchMock.called(url)).toBe(true);
      expect(
        screen.getByRole('combobox', { name: /Server/i })
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('combobox', { name: /Server/i })).toHaveValue('1');
  });
});
