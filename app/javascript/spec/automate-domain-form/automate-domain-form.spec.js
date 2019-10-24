import React from 'react';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import { componentTypes as components } from '@data-driven-forms/react-form-renderer';
import schema from '../../components/automate-domain-form/domain-form.schema';
import NamespaceForm from '../../components/automate-domain-form';
import { mount } from '../helpers/mountForm';
import '../helpers/miqFlashLater';
import '../helpers/miqSparkle';
import '../helpers/addFlash';
import '../helpers/sprintf';
import miqRedirectBack from '../../helpers/miq-redirect-back';

describe('Automate Domain form component', () => {
  const flashSpy = jest.spyOn(window, 'add_flash');
  let wrapper;

  const defaultProps = {
    id: 2222,
  };

  afterEach(() => {
    wrapper = undefined;
    fetchMock.restore();
  });

  it('should correctly create the schema', () => {
    const expectedResult = [
      expect.objectContaining({
        component: components.TEXT_FIELD,
        isReadOnly: false,
        label: 'Name:',
        name: 'name',
      }),
      expect.objectContaining({
        component: components.TEXT_FIELD,
        isReadOnly: false,
        label: 'Description:',
        name: 'description',
      }),
      expect.objectContaining({
        component: components.SWITCH,
        label: 'Enabled:',
        name: 'enabled',
      })];

    const { fields } = schema(false);
    expect(fields).toEqual(expectedResult);
  });


  it('should correctly initialize the component', async(done) => {
    fetchMock
      .getOnce('/api/automate_domains/2222?attributes=name,description,enabled,source',
        {
          name: 'f', description: 'a', enabled: null, source: 'user',
        });

    await act(async() => { wrapper = mount(<NamespaceForm {...defaultProps} />); });
    await act(async() => wrapper.update());

    expect(wrapper.find('label').first().text()).toEqual('Name:');
    expect(wrapper.find('input').first().instance().value).toEqual('f');
    done();
  });

  it('should send correct data on submit', async(done) => {
    fetchMock.getOnce('/api/automate_domains/2222?attributes=name,description,enabled,source',
      {
        name: 's', description: 'z', enabled: true, source: 'user',
      }).postOnce('/api/automate_domains/2222', {});

    await act(async() => { wrapper = mount(<NamespaceForm {...defaultProps} />); });
    await act(async() => {
      wrapper.update();
      wrapper.find('input#name').simulate('change', { target: { value: 'New' } });
      wrapper.find('input#description').simulate('change', { target: { value: 'This is really New' } });
    });
    await act(async() => wrapper.find('button').at(0).simulate('click'));

    expect(fetchMock.lastCall()[1].body).toBe(JSON.stringify({
      action: 'edit',
      name: 'New',
      description: 'This is really New',
      enabled: true,
    }));
    done();
  });

  it('should reset the form values and add a flash message', async(done) => {
    fetchMock
      .getOnce('/api/automate_domains/2222?attributes=name,description,enabled,source',
        {
          name: 's', description: 'z', enabled: true, source: 'user',
        });

    await act(async() => { wrapper = mount(<NamespaceForm {...defaultProps} />); });
    await act(async() => wrapper.update());

    expect(wrapper.find('input#name').props().value).toEqual('s');

    await act(async() => wrapper.find('input#name').simulate('change', { target: { value: 'szlovoszlejd' } }));
    await act(async() => wrapper.update());

    expect(wrapper.find('input#name').props().value).toEqual('szlovoszlejd');

    await act(async() => wrapper.find('button').at(1).simulate('click'));
    await act(async() => wrapper.update());
    expect(wrapper.find('input#name').props().value).toEqual('s');
    expect(flashSpy).toHaveBeenCalledWith(expect.any(String), 'warn');

    done();
  });

  it('should redirect on cancel', async(done) => {
    fetchMock
      .getOnce('/api/automate_domains/2222?attributes=name,description,enabled,source',
        {
          name: 's', description: 'z', enabled: true, source: 'user',
        });
    await act(async() => { wrapper = mount(<NamespaceForm {...defaultProps} />); });
    await act(async() => wrapper.update());
    await act(async() => wrapper.find('button').at(2).simulate('click'));
    expect(miqRedirectBack).toHaveBeenCalledWith(expect.any(String), 'success', '/miq_ae_class/explorer');
    done();
  });
});
