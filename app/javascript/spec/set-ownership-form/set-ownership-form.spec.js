import React from 'react';
import { mount } from 'enzyme';
import FormRenderer from '@data-driven-forms/react-form-renderer';
import SetOwnershipForm from '../../components/set-ownership-form';
import createSchema from '../../components/set-ownership-form/ownership-form.schema';
import { http } from '../../http_api';
import '../helpers/miqAjaxButton';
import '../helpers/addFlash';

describe('Set ownership form component', () => {
  let initialProps;
  const httpSpy = jest.spyOn(http, 'post');
  const submitSpy = jest.spyOn(window, 'miqAjaxButton');
  const flashSpy = jest.spyOn(window, 'add_flash');

  beforeEach(() => {
    initialProps = {
      ownershipIds: ['123456'],
      groupOptions: [['Foo', '1'], ['Bar', '2']],
      ownerOptions: [['Baz', '3'], ['Quxx', '4']],
    };
    global.ManageIQ.controller = 'service';
  });

  afterEach(() => {
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

  // TO DO replace with actual request mock
  it('should request initialForm values after mount', () => {
    mount(<SetOwnershipForm {...initialProps} />);
    expect(httpSpy).toHaveBeenCalledWith('/service/ownership_form_fields', { object_ids: ['123456'] });
  });

  it('should send correct data on save', () => {
    const wrapper = mount(<SetOwnershipForm {...initialProps} />);
    const Form = wrapper.find(FormRenderer).childAt(0);
    Form.instance().form.change('user', 'foo');
    wrapper.find('button').at(0).simulate('click');
    expect(submitSpy).toHaveBeenCalledWith('/service/ownership_update/?button=save', { objectIds: ['123456'], user: 'foo' });
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
