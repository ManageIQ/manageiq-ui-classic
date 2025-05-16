import React from 'react';
import { act } from 'react-dom/test-utils';
import fetchMock from 'fetch-mock';
import { mount } from '../helpers/mountForm';
import OpsTenantForm from '../../components/ops-tenant-form/ops-tenant-form';
import MiqFormRenderer from '../../forms/data-driven-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';

import '../helpers/miqSparkle';
import '../helpers/addFlash';
import '../helpers/miqFlashLater';
import '../helpers/sprintf';

describe('OpstTenantForm', () => {
  let initialProps;
  const sparkleOnSpy = jest.spyOn(window, 'miqSparkleOn');
  const sparkleOffSpy = jest.spyOn(window, 'miqSparkleOff');
  const flashSpy = jest.spyOn(window, 'add_flash');
  const flashLaterSpy = jest.spyOn(window, 'miqFlashLater');
  beforeEach(() => {
    initialProps = {
      recordId: null,
      divisible: false,
      ancestry: null,
      redirectUrl: '/foo/bar',
    };
  });

  afterEach(() => {
    fetchMock.reset();
    sparkleOnSpy.mockReset();
    sparkleOffSpy.mockReset();
    flashSpy.mockReset();
    flashLaterSpy.mockReset();
  });

  it('should mount form without initialValues', async(done) => {
    fetchMock.getOnce(`/api/tenants/${initialProps.recordId}?expand=resources&attributes=name,description,use_config_for_attributes,ancestry,divisible`, {
      name: 'foo',
    });
    let wrapper;
    await act(async() => {
      wrapper = mount(<OpsTenantForm {...initialProps} />);
    });

    wrapper.update();
    expect(wrapper.find(MiqFormRenderer).props().initialValues).toEqual({});
    expect(fetchMock.calls().length).toEqual(0);
    expect(sparkleOnSpy).not.toHaveBeenCalled();
    expect(sparkleOffSpy).not.toHaveBeenCalled();
    done();
  });

  it('should mount and set initialValues', async(done) => {
    fetchMock.getOnce('/api/tenants/123?expand=resources&attributes=name,description,use_config_for_attributes,ancestry,divisible', {
      name: 'foo',
    });
    let wrapper;
    await act(async() => {
      wrapper = mount(<OpsTenantForm {...initialProps} recordId={123} />);
    });

    wrapper.update();
    expect(wrapper.find(MiqFormRenderer).props().initialValues).toEqual({
      name: 'foo',
    });
    expect(fetchMock.calls()).toHaveLength(1);
    expect(sparkleOnSpy).toHaveBeenCalled();
    expect(sparkleOffSpy).toHaveBeenCalled();
    done();
  });

  it('should call miqRedirectBack when canceling form', async(done) => {
    fetchMock.getOnce('/api/tenants?filter[]=name=&expand=resources', {
      resources: [],
    });
    let wrapper;
    await act(async() => {
      wrapper = mount(<OpsTenantForm {...initialProps} />);
    });

    wrapper.find('button.bx--btn--secondary').first().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith('Creation of new Project was canceled by the user.', 'warning', '/foo/bar');
    done();
  });

  it('should correctly add new entity.', async(done) => {
    fetchMock.getOnce('/api/tenants?filter[]=name=foo&expand=resources', {
      resources: [],
    });
    fetchMock.postOnce('/api/tenants', {});
    const wrapper = mount(<OpsTenantForm {...initialProps} />);
    wrapper.find('input').at(0).simulate('change', { target: { value: 'foo' } });
    wrapper.find('input').at(1).simulate('change', { target: { value: 'bar' } });

    wrapper.update();

    setTimeout(async() => {
      await act(async() => {
        wrapper.find('form').simulate('submit');
      });
      expect(JSON.parse(fetchMock.calls()[1][1].body)).toEqual({
        name: 'foo',
        description: 'bar',
        divisible: false,
        parent: { id: null },
      });
      expect(miqRedirectBack).toHaveBeenCalledWith('Project "foo" has been successfully added.', 'success', '/foo/bar');
      done();
    }, 500);
  });

  it('should correctly edit existing entity.', async(done) => {
    fetchMock.getOnce('/api/tenants/123?expand=resources&attributes=name,description,use_config_for_attributes,ancestry,divisible', {
      name: 'foo',
      description: 'bar',
      ancestry: null,
      use_config_for_attributes: true,
      divisible: false,
    });
    fetchMock.getOnce('/api/tenants?filter[]=name=foo&expand=resources', {
      resources: [],
    });
    fetchMock.putOnce('/api/tenants/123', {});
    let wrapper;
    await act(async() => {
      wrapper = mount(<OpsTenantForm {...initialProps} recordId={123} />);
    });

    wrapper.update();

    await act(async() => {
      wrapper.find('input').at(1).simulate('change', { target: { value: 'desc' } });
    });
    wrapper.update();
    setTimeout(async() => {
      await act(async() => {
        wrapper.find('form').simulate('submit');
      });
      expect(JSON.parse(fetchMock.calls()[2][1].body)).toEqual({
        name: 'foo',
        description: 'desc',
        divisible: false,
        use_config_for_attributes: true,
      });
      expect(miqRedirectBack).toHaveBeenCalledWith('Project "foo" has been successfully saved.', 'success', '/foo/bar');
      done();
    }, 500);
  });
});
