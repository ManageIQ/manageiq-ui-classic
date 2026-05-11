import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

import PxeServersForm from '../../components/pxe-servers-form/pxe-server-form';
import { renderWithRedux } from '../helpers/mountForm';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { asyncValidator } from '../../components/pxe-servers-form/pxe-server-form.schema';
import '../helpers/miqSparkle';

describe('PxeServersForm', () => {
  let initialProps;

  beforeEach(() => {
    initialProps = {};
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it('should render correctly', async () => {
    fetchMock.getOnce(
      '/api/pxe_servers?expand=resources&filter[]=name==%27%27',
      { resources: [] }
    );

    const { container } = renderWithRedux(<PxeServersForm {...initialProps} />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render correctly in edit variant', async () => {
    fetchMock
      .getOnce(
        '/api/pxe_servers/123?attributes=access_url,authentications,customization_directory,name,pxe_directory,pxe_menus,uri,windows_images_directory',
        {
          // eslint-disable-line max-len
          pxe_menus: [{ file_name: 'bar' }],
          authentications: [{ userid: 'Pepa', foo: 'bar' }],
        }
      )
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name==%27%27', {
        resources: [],
      });

    const { container } = renderWithRedux(
      <PxeServersForm {...initialProps} id="123" />
    );

    /**
     * wait for name async validation and state updates
     */
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
  });

  it('should successfully call add action while editing', async () => {
    fetchMock
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name==%27%27', {
        resources: [],
      })
      .getOnce(
        '/api/pxe_servers?expand=resources&filter[]=name==%27my%20name%27',
        { resources: [] }
      )
      .postOnce('/api/pxe_servers', {});

    const user = userEvent.setup();
    const { container } = renderWithRedux(<PxeServersForm {...initialProps} />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    const nameInput = container.querySelector('input[name="name"]');
    const uriInput = container.querySelector('input[name="uri"]');

    await user.clear(nameInput);
    await user.type(nameInput, 'my name');
    await user.clear(uriInput);
    await user.type(uriInput, 'nfs://foo/bar');

    /**
     * wait for name async validation
     */
    await waitFor(() => {
      expect(
        fetchMock.calls(
          '/api/pxe_servers?expand=resources&filter[]=name==%27my%20name%27'
        ).length
      ).toBe(1);
    });

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    /**
     * wait for submit response
     */
    await waitFor(() => {
      expect(fetchMock.calls('/api/pxe_servers', 'POST').length).toBe(1);
    });

    const [_url, payload] = fetchMock.lastCall();
    expect(JSON.parse(payload.body)).toEqual({
      name: 'my name',
      uri: 'nfs://foo/bar',
      authentication: {},
    });
  });

  it('should successfully call cancel add server action', async () => {
    fetchMock.getOnce(
      '/api/pxe_servers?expand=resources&filter[]=name==%27%27',
      { resources: [] }
    );

    const user = userEvent.setup();
    renderWithRedux(<PxeServersForm {...initialProps} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Add of new PXE Server was cancelled by the user',
      'success',
      '/pxe/explorer'
    );
  });

  it('should successfully call cancel edit server action', async () => {
    fetchMock
      .getOnce(
        '/api/pxe_servers/123?attributes=access_url,authentications,customization_directory,name,pxe_directory,pxe_menus,uri,windows_images_directory',
        {
          // eslint-disable-line max-len
          pxe_menus: [{ file_name: 'bar' }],
          authentications: [],
          name: 'foo',
        }
      )
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name==%27%27', {
        resources: [],
      })
      .getOnce('/api/pxe_servers?expand=resources&filter[]=name==%27foo%27', {
        resources: [],
      });

    const user = userEvent.setup();
    renderWithRedux(<PxeServersForm {...initialProps} id="123" />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Edit of PXE Server foo was cancelled by the user',
      'success',
      '/pxe/explorer'
    );
  });

  describe('asyncValidator on name field', () => {
    afterEach(() => {
      fetchMock.reset();
    });

    it('should allow a unique name', async () => {
      const name = 'foo';
      const expectedUrl = `/api/pxe_servers?expand=resources&filter[]=name==%27${name}%27`;

      fetchMock.getOnce(expectedUrl, { resources: [] });

      await expect(asyncValidator(name, null)).resolves.toBeUndefined();
    });

    it('should handle duplicate name validation', async () => {
      const name = 'foo';
      const id = 123;
      const expectedUrl = `/api/pxe_servers?expand=resources&filter[]=name==%27${name}%27`;

      fetchMock.getOnce(expectedUrl, {
        resources: [
          { id: 456, name }, // different server id
        ],
      });

      await expect(asyncValidator(name, id)).rejects.toBe(
        'Name has already been taken'
      );
    });

    it('should allow same name when editing the same server', async () => {
      const name = 'foo';
      const id = 123;
      const expectedUrl = `/api/pxe_servers?expand=resources&filter[]=name==%27${name}%27`;

      fetchMock.getOnce(expectedUrl, {
        resources: [
          { id, name }, // same server id
        ],
      });

      await expect(asyncValidator(name, id)).resolves.toBeUndefined();
    });

    it('should properly encode all special characters in name parameter', async () => {
      const name = 'test &=%#?\'"/ name';
      const encodedName = encodeURIComponent(name);
      const expectedUrl = `/api/pxe_servers?expand=resources&filter[]=name==%27${encodedName}%27`;

      fetchMock.getOnce(expectedUrl, { resources: [] });

      await expect(asyncValidator(name, null)).resolves.toBeUndefined();
    });

    it('should handle duplicate name validation with encoded characters', async () => {
      const name = 'test & server';
      const id = 123;
      const encodedName = encodeURIComponent(name);
      const expectedUrl = `/api/pxe_servers?expand=resources&filter[]=name==%27${encodedName}%27`;

      fetchMock.getOnce(expectedUrl, {
        resources: [
          { id: 456, name }, // different server id
        ],
      });

      await expect(asyncValidator(name, id)).rejects.toBe(
        'Name has already been taken'
      );
    });

    it('should reject empty name', async () => {
      await expect(asyncValidator('', null)).rejects.toBe('Required');
      expect(fetchMock.calls().length).toBe(0);
    });

    it('should reject undefined name', async () => {
      await expect(asyncValidator(undefined, null)).rejects.toBe('Required');
      expect(fetchMock.calls().length).toBe(0);
    });

    it('should reject null name', async () => {
      await expect(asyncValidator(null, null)).rejects.toBe('Required');
      expect(fetchMock.calls().length).toBe(0);
    });
  });
});
