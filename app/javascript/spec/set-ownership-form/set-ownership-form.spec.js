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

  it('should correctly map group and owner options ', () => {
    const groupOptions = [{ label: 'Foo', value: '1' }, { label: 'Bar', value: '2' }];
    const ownerOptions = [{ label: 'Baz', value: '3' }, { label: 'Qux', value: '4' }];

    const expectedResult = [
      expect.objectContaining({
        options: [{
          value: '3',
          label: 'Baz',
        }, {
          value: '4',
          label: 'Qux',
        }],
      }),
      expect.objectContaining({
        options: [{
          value: '1',
          label: 'Foo',
        }, {
          value: '2',
          label: 'Bar',
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
    const Form = wrapper.find(FormRenderer).childAt(0);
    Form.instance().form.change('user', 'z');
    wrapper.update();
    await act(async() => {
      wrapper.find('form').simulate('submit');
    });
    expect(submitSpy).toHaveBeenCalledWith('/vms/ownership_update/?button=save', { objectIds: ['123456'] });
    done();
  });

  it('should send correct data on cancel', () => {
    const wrapper = mount(<SetOwnershipForm {...initialProps} />);
    wrapper.find('button').last().simulate('click');
    expect(submitSpy).toHaveBeenCalledWith('/vms/ownership_update/?button=cancel');
  });

  it('should reset formValues and add flash messages on reset click', () => {
    const wrapper = mount(<SetOwnershipForm {...initialProps} />);
    const Form = wrapper.find(FormRenderer).childAt(0);
    Form.instance().form.change('user', 'foo');
    expect(Form.instance().form.getState().values).toEqual({ user: 'foo' });
    wrapper.find('button').at(1).simulate('click');
    expect(Form.instance().form.getState().values).toEqual({});
    expect(flashSpy).toHaveBeenCalledWith(expect.any(String), 'warn');
  });
});
