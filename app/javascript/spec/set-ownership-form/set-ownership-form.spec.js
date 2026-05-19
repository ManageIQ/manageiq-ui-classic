import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import SetOwnershipForm from '../../components/set-ownership-form';
import createSchema from '../../components/set-ownership-form/ownership-form.schema';
import '../helpers/miqAjaxButton';
import '../helpers/miqSparkle';
import { renderWithRedux } from '../helpers/mountForm';

describe('Set ownership form component', () => {
  let initialProps;
  const submitSpy = jest.spyOn(window, 'miqAjaxButton');
  const flashSpy = jest.spyOn(window, 'add_flash');

  beforeEach(() => {
    initialProps = {
      ownershipItems: [{ id: '123456', kind: 'vms' }],
    };
    global.ManageIQ.controller = 'vms';
  });

  afterEach(() => {
    fetchMock.restore();
    submitSpy.mockReset();
    flashSpy.mockReset();
    global.ManageIQ.controller = null;
  });

  it('should correctly map group and owner options', () => {
    const groupOptions = [
      { label: 'Foo', value: '1', key: 'key_1' },
      { label: 'Bar', value: '2', key: 'key_2' },
    ];
    const ownerOptions = [
      { label: 'Baz', value: '3', key: 'key_1' },
      { label: 'Qux', value: '4', key: 'key_2' },
    ];

    const expectedResult = [
      expect.objectContaining({
        options: [
          {
            value: '3',
            label: 'Baz',
            key: 'key_1',
          },
          {
            value: '4',
            label: 'Qux',
            key: 'key_2',
          },
        ],
      }),
      expect.objectContaining({
        options: [
          {
            value: '1',
            label: 'Foo',
            key: 'key_1',
          },
          {
            value: '2',
            label: 'Bar',
            key: 'key_2',
          },
        ],
      }),
    ];
    const { fields } = createSchema(ownerOptions, groupOptions);
    expect(fields).toEqual(expectedResult);
  });

  it('should request initialForm values after mount', async() => {
    fetchMock
      .getOnce(
        '/api/vms/123456?expand=resources&attributes=evm_owner_id,miq_group_id',
        { evm_owner_id: 'a', miq_group_id: 'z2' }
      )
      .getOnce(
        '/api/users?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending',
        {
          resources: [
            { name: 'f', id: 'a' },
            { name: 's', id: 'z' },
          ],
        }
      )
      .getOnce(
        '/api/groups?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending',
        {
          resources: [
            { description: 'f2', id: 'a2' },
            { description: 's2', id: 'z2' },
          ],
        }
      )
      .getOnce('/api/tenant_groups/z2', {});
    const { container } = renderWithRedux(
      <SetOwnershipForm {...initialProps} />
    );

    await waitFor(() => {
      expect(fetchMock.calls().length).toBe(4);
      const wrapper = container.querySelector('#set-ownership-form');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper.querySelector('form')).toBeInTheDocument();
      expect(
        screen.getByRole('combobox', { name: /Select an Owner/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('combobox', { name: /Select a Group/i })
      ).toBeInTheDocument();
    });
  });

  it('should send correct data on save', async() => {
    const user = userEvent.setup();
    fetchMock
      .getOnce(
        '/api/vms/123456?expand=resources&attributes=evm_owner_id,miq_group_id',
        { evm_owner_id: 'a', miq_group_id: 'z2' }
      )
      .getOnce(
        '/api/users?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending',
        {
          resources: [
            { name: 'f', id: 'a' },
            { name: 's', id: 'z' },
          ],
        }
      )
      .getOnce(
        '/api/groups?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending',
        {
          resources: [
            { description: 'f2', id: 'a2' },
            { description: 's2', id: 'z2' },
          ],
        }
      )
      .getOnce('/api/tenant_groups/z2', {})
      .postOnce('/api/vms', {});
    const { container } = renderWithRedux(
      <SetOwnershipForm {...initialProps} />
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
      expect(
        screen.getByRole('combobox', { name: /Select an Owner/i })
      ).toBeInTheDocument();
    });
    const userSelect = screen.getByRole('combobox', {
      name: /Select an Owner/i,
    });
    await user.selectOptions(userSelect, 'z');
    const submitButton = container.querySelector('button.cds--btn--primary');
    await user.click(submitButton);
    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith(
        '/vms/ownership_update/?button=save',
        { objectIds: ['123456'] }
      );
    });
  });

  it('should send correct data on cancel', async() => {
    const user = userEvent.setup();
    fetchMock
      .getOnce(
        '/api/vms/123456?expand=resources&attributes=evm_owner_id,miq_group_id',
        { evm_owner_id: 'a', miq_group_id: 'z2' }
      )
      .getOnce(
        '/api/users?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending',
        {
          resources: [
            { name: 'f', id: 'a' },
            { name: 's', id: 'z' },
          ],
        }
      )
      .getOnce(
        '/api/groups?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending',
        {
          resources: [
            { description: 'f2', id: 'a2' },
            { description: 's2', id: 'z2' },
          ],
        }
      )
      .getOnce('/api/tenant_groups/z2', {});
    renderWithRedux(<SetOwnershipForm {...initialProps} />);

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: /Select an Owner/i })
      ).toBeInTheDocument();
    });
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);
    expect(submitSpy).toHaveBeenCalledWith(
      '/vms/ownership_update/?button=cancel&objectIds=123456'
    );
  });
});
