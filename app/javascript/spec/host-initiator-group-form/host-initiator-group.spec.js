import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import HostInitiatorGroupForm from '../../components/host-initiator-group-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';

describe('Host Initiator Group Form', () => {
  beforeEach(() => {
    fetchMock.mock(
      `/api/host_initiator_groups?expand=resources&attributes=name`,
      {
        resources: [],
      }
    );
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  const attributes = 'attributes=id,name,supports_block_storage';
  const filters = 'filter[]=supports_block_storage=true&filter[]=supports_create_host_initiator_group=true';

  it('Loads data and renders', async() => {
    const user = userEvent.setup();

    fetchMock.mock(`/api/providers?expand=resources&${attributes}&${filters}`, {
      resources: [
        {
          href: 'https://9.151.190.173/api/providers/2',
          id: '2',
          name: '172',
          supports_block_storage: true,
        },
      ],
    });
    fetchMock.mock('/api/providers/2?attributes=type,physical_storages', {
      physical_storages: [
        { id: 1, name: '178' },
        { id: 2, name: '179' },
      ],
    });

    fetchMock.post('/api/host_initiator_groups', {});

    const { container } = renderWithRedux(<HostInitiatorGroupForm />);

    await waitFor(() => {
      expect(
        fetchMock.called(
          `/api/providers?expand=resources&${attributes}&${filters}`
        )
      ).toBe(true);
    });

    expect(
      fetchMock.called('/api/providers/2?attributes=type,physical_storages')
    ).toBe(false);

    const emsSelect = container.querySelector('select[name="ems_id"]');
    await user.selectOptions(emsSelect, '2');

    await waitFor(() => {
      expect(
        fetchMock.called('/api/providers/2?attributes=type,physical_storages')
      ).toBe(true);
    });

    const storageSelect = container.querySelector(
      'select[name="physical_storage_id"]'
    );
    await user.selectOptions(storageSelect, '1');

    const nameInput = container.querySelector('input[name="name"]');
    await user.type(nameInput, 'my_group');

    expect(container).toMatchSnapshot();
  });

  it('Calls miqRedirectBack when canceling create form', async() => {
    const user = userEvent.setup();

    fetchMock.mock(`/api/providers?expand=resources&${attributes}&${filters}`, {
      resources: [
        {
          href: 'https://9.151.190.173/api/providers/2',
          id: '2',
          name: '172',
          supports_block_storage: true,
        },
      ],
    });
    fetchMock.mock('/api/providers/2?attributes=type,physical_storages', {
      physical_storages: [
        { id: 1, name: '178' },
        { id: 2, name: '179' },
      ],
    });

    renderWithRedux(<HostInitiatorGroupForm />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    const message = 'Creation of new Host Initiator Group was canceled by the user';
    expect(miqRedirectBack).toHaveBeenCalledWith(
      message,
      'warning',
      '/host_initiator_group/show_list'
    );
  });
});
