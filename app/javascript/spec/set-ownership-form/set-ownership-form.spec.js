import React from 'react';
import { act } from 'react-dom/test-utils';
import fetchMock from 'fetch-mock';
import FormRenderer from '@data-driven-forms/react-form-renderer';
import SetOwnershipForm from '../../components/set-ownership-form';
import createSchema from '../../components/set-ownership-form/ownership-form.schema';
import '../helpers/miqAjaxButton';
import '../helpers/miqSparkle';
import '../helpers/addFlash';
import { mount } from '../helpers/mountForm';

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
    const groupOptions = [{ label: 'Foo', value: '1', key: 'key_1' }, { label: 'Bar', value: '2', key: 'key_2' }];
    const ownerOptions = [{ label: 'Baz', value: '3', key: 'key_1' }, { label: 'Qux', value: '4', key: 'key_2' }];

    const expectedResult = [
      expect.objectContaining({
        options: [{
          value: '3',
          label: 'Baz',
          key: 'key_1',
        }, {
          value: '4',
          label: 'Qux',
          key: 'key_2',
        }],
      }),
      expect.objectContaining({
        options: [{
          value: '1',
          label: 'Foo',
          key: 'key_1',
        }, {
          value: '2',
          label: 'Bar',
          key: 'key_2',
        }],
      }),
    ];
    const { fields } = createSchema(ownerOptions, groupOptions);
    expect(fields).toEqual(expectedResult);
  });

  it('should request initialForm values after mount', async(done) => {
    fetchMock
      .getOnce('/api/vms/123456?expand=resources&attributes=evm_owner_id,miq_group_id',
        { evm_owner_id: 'a', miq_group_id: 'z2' })
      .getOnce('/api/users?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending',
        { resources: [{ name: 'f', id: 'a' }, { name: 's', id: 'z' }] })
      .getOnce('/api/groups?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending',
        { resources: [{ description: 'f2', id: 'a2' }, { description: 's2', id: 'z2' }] })
      .getOnce('/api/tenant_groups/z2', {});

    let wrapper;
    await act(async() => {
      wrapper = mount(<SetOwnershipForm {...initialProps} />);
    });

    expect(wrapper.contains(<SetOwnershipForm {...initialProps} />)).toBeTruthy();
    done();
  });

  it('should send correct data on save', async(done) => {
    fetchMock
      .getOnce('/api/vms/123456?expand=resources&attributes=evm_owner_id,miq_group_id',
        { evm_owner_id: 'a', miq_group_id: 'z2' })
      .getOnce('/api/users?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending',
        { resources: [{ name: 'f', id: 'a' }, { name: 's', id: 'z' }] })
      .getOnce('/api/groups?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending',
        { resources: [{ description: 'f2', id: 'a2' }, { description: 's2', id: 'z2' }] })
      .getOnce('/api/tenant_groups/z2', {})
      .postOnce('/api/vms', {});

    let wrapper;
    await act(async() => {
      wrapper = mount(<SetOwnershipForm {...initialProps} />);
    });
    const form = wrapper.find('form');
    form.find('select[name="user"]').simulate('change', 'z');
    wrapper.update();
    await act(async() => {
      wrapper.find('form').simulate('submit');
    });
    expect(submitSpy).toHaveBeenCalledWith('/vms/ownership_update/?button=save', { objectIds: ['123456'] });
    done();
  });

  it('should send correct data on cancel', () => {
    const wrapper = mount(<SetOwnershipForm {...initialProps} />);
    wrapper.find('button.bx--btn--secondary').last().simulate('click');
    expect(submitSpy).toHaveBeenCalledWith('/vms/ownership_update/?button=cancel&objectIds=123456');
  });
});
