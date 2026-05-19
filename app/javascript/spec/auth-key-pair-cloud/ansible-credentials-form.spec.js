import React from 'react';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import '../helpers/miqSparkle';
import { renderWithRedux } from '../helpers/mountForm';
import AuthKeypairCloudForm from '../../components/auth-key-pair-cloud/index';

describe('Add testcases for creating new auth key pair', () => {
  const emsList = {
    resources: [
      { name: 'name1', id: 1 },
      { name: 'name2', id: 2 },
    ],
  };

  const values = {
    name: 'key1',
    public_key: 'abc',
    ems_id: 2,
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render a auth key pair form', async() => {
    fetchMock.mock(
      '/api/providers?expand=resources&attributes=id,name,supports_auth_key_pair_create&filter[]=supports_auth_key_pair_create=true',
      emsList
    );

    const { container } = renderWithRedux(<AuthKeypairCloudForm />);

    // Wait for the form to load
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should correctly add new key pair .', async() => {
    const user = userEvent.setup();
    fetchMock.mock(
      '/api/providers?expand=resources&attributes=id,name,supports_auth_key_pair_create&filter[]=supports_auth_key_pair_create=true',
      emsList
    );
    fetchMock.postOnce('/api/auth_key_pairs', values);

    const { container } = renderWithRedux(<AuthKeypairCloudForm />);

    // Wait for form to load
    await waitFor(() => {
      expect(container.querySelector('input')).toBeInTheDocument();
    });

    // Find and fill the first input
    const firstInput = container.querySelector('input');
    await user.type(firstInput, 'key1');

    // Find and click the first button (submit)
    const submitButton = container.querySelector('button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(2);
    });
  });

  it('should call miqRedirectBack when canceling form', async() => {
    const user = userEvent.setup();
    fetchMock.mock(
      '/api/providers?expand=resources&attributes=id,name,supports_auth_key_pair_create&filter[]=supports_auth_key_pair_create=true',
      emsList
    );

    const { container } = renderWithRedux(<AuthKeypairCloudForm />);

    // Wait for form to load
    await waitFor(() => {
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    // Find all buttons and click the last one (cancel)
    const buttons = container.querySelectorAll('button');
    const cancelButton = buttons[buttons.length - 1];
    await user.click(cancelButton);

    expect(miqRedirectBack).toHaveBeenCalledWith('Add of new Key Pair was cancelled by the user', 'warning', '/auth_key_pair_cloud/show_list');
  });
});
