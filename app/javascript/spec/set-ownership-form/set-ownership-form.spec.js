import React from 'react';
import { mount } from 'enzyme';
import fetchMock from 'fetch-mock';
import FormRenderer from '@data-driven-forms/react-form-renderer';
import SetOwnershipForm from '../../components/set-ownership-form';
import createSchema from '../../components/set-ownership-form/ownership-form.schema';
import '../helpers/miqAjaxButton';
import '../helpers/miqSparkle';
import '../helpers/addFlash';

describe('Set ownership form component', () => {
  let initialProps;
  const submitSpy = jest.spyOn(window, 'miqAjaxButton');
  const flashSpy = jest.spyOn(window, 'add_flash');

  beforeEach(() => {
    initialProps = {
      ownershipItems: [{ id: '123456', kind: 'vms' }],
      groupOptions: [{ label: 'Foo', value: '1' }, { label: 'Bar', value: '2' }],
      ownerOptions: [{ label: 'Baz', value: '3' }, { label: 'Quxx', value: '4' }],
    };
    global.ManageIQ.controller = 'service';
  });

  afterEach(() => {
    fetchMock.restore();
    submitSpy.mockReset();
    flashSpy.mockReset();
    global.ManageIQ.controller = null;
  });

  it('should correctly map group and owner options ', () => {
    const expectedResult = [
      expect.objectContaining({
        options: [{
          value: '3',
          label: 'Baz',
        }, {
          value: '4',
          label: 'Quxx',
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
    const { fields } = createSchema(initialProps.ownerOptions, initialProps.groupOptions);
    expect(fields).toEqual(expectedResult);
  });

  it('should request initialForm values after mount', (done) => {
    fetchMock
      .getOnce('/api/vms/123456?expand=resources&attributes=evm_owner_id,miq_group_id',
        { evm_owner_id: '1', miq_group_id: '2' })
      .getOnce('/api/users?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending',
        { resources: [{ name: 'f', id: 'a' }] })
      .getOnce('/api/groups?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending',
        { resources: [{ description: 's', id: 'z' }] })
      .getOnce('/api/tenant_groups/2', {});

    const wrapper = mount(<SetOwnershipForm {...initialProps} />);
    setImmediate(() => {
      setImmediate(() => {
        setImmediate(() => {
          expect(wrapper.contains(<SetOwnershipForm {...initialProps} />)).toBeTruthy();
          done();
        });
      });
    });
  });

  it('should send correct data on save', (done) => {
    fetchMock
      .getOnce('/api/vms/123456?expand=resources&attributes=evm_owner_id,miq_group_id',
        { evm_owner_id: '1', miq_group_id: '2' })
      .getOnce('/api/users?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending',
        { resources: [{ name: 'f', id: 'a' }] })
      .getOnce('/api/groups?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending',
        { resources: [{ description: 's', id: 'z' }] })
      .getOnce('/api/tenant_groups/2', {})
      .postOnce('/api/vms', {});

    const wrapper = mount(<SetOwnershipForm {...initialProps} />);
    const instance = wrapper.instance();
    setImmediate(() => {
      setImmediate(() => {
        setImmediate(() => {
          instance.handleSubmit({ user: 1, group: 1 }, '/vms/ownership_update/?button=save');
          setImmediate(() => {
            setImmediate(() => {
              expect(submitSpy).toHaveBeenCalledWith('/vms/ownership_update/?button=save', { objectIds: ['123456'] });
              done();
            });
          });
        });
      });
    });
  });

  it('should send correct data on cancel', () => {
    const wrapper = mount(<SetOwnershipForm {...initialProps} />);
    wrapper.find('button').last().simulate('click');
    expect(submitSpy).toHaveBeenCalledWith('/service/ownership_update/?button=cancel');
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
