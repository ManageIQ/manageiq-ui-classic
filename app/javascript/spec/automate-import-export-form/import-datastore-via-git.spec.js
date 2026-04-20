import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

import ImportDatastoreViaGit from '../../components/automate-import-export-form/import-datastore-via-git';
import { renderWithRedux } from '../helpers/mountForm';

describe('Import datastore via git component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render correctly', () => {
    const { container } = renderWithRedux(<ImportDatastoreViaGit />);
    expect(container).toMatchSnapshot();
  });

  it('should have submit button disabled when url is not valid', () => {
    renderWithRedux(<ImportDatastoreViaGit />);
    const button = screen.getByRole('button', { name: /save/i });
    expect(button).toBeDisabled();
  });

  it('should have submit button always disabled', async() => {
    const user = userEvent.setup();
    renderWithRedux(<ImportDatastoreViaGit disableSubmit />);

    const input = screen.getByRole('textbox', { name: /git url/i });
    await user.type(input, 'http://');

    const button = screen.getByRole('button', { name: /save/i });
    expect(button).toBeDisabled();
  });

  it('should call api correct endpoint after submit', async() => {
    const flashSpy = jest.spyOn(window, 'add_flash');
    fetchMock.postOnce('/miq_ae_tools/retrieve_git_datastore', [{ message: 'Foo', level: 'Bar' }]);

    const user = userEvent.setup();
    renderWithRedux(<ImportDatastoreViaGit />);

    const input = screen.getByRole('textbox', { name: /git url/i });
    await user.type(input, 'http://');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(fetchMock.called('/miq_ae_tools/retrieve_git_datastore')).toBe(true);
    });

    const lastCall = fetchMock.lastCall();
    expect(lastCall[0]).toBe('/miq_ae_tools/retrieve_git_datastore');
    expect(lastCall[1].body).toBe('{"git_url":"http://","git_verify_ssl":true}');
    expect(flashSpy).toHaveBeenCalledWith('Foo', 'Bar');
  });
});
