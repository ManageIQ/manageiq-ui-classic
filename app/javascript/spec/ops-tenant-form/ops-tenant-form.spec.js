import React from 'react';
import { mount } from 'enzyme';
import fetchMock from 'fetch-mock';
import OpsTenantForm from '../../components/ops-tenant-form/ops-tenant-form';
import MiqFormRenderer from '../../forms/data-driven-form';

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

  it('should mount form without initialValues', (done) => {
    fetchMock.getOnce(`/api/tenants/${initialProps.recordId}?expand=resources&attributes=name,description,use_config_for_attributes,ancestry`, {
      name: 'foo',
    });
    const wrapper = mount(<OpsTenantForm {...initialProps} />);
    setImmediate(() => {
      wrapper.update();
      expect(wrapper.find(MiqFormRenderer).props().initialValues).toEqual({});
      expect(fetchMock.calls().length).toEqual(0);
      expect(sparkleOnSpy).not.toHaveBeenCalled();
      expect(sparkleOffSpy).not.toHaveBeenCalled();
      done();
    });
  });

  it('should mount and set initialValues', (done) => {
    fetchMock.getOnce('/api/tenants/123?expand=resources&attributes=name,description,use_config_for_attributes,ancestry', {
      name: 'foo',
    });
    const wrapper = mount(<OpsTenantForm {...initialProps} recordId={123} />);
    setImmediate(() => {
      wrapper.update();
      expect(wrapper.find(MiqFormRenderer).props().initialValues).toEqual({
        name: 'foo',
      });
      expect(fetchMock.calls()).toHaveLength(1);
      expect(sparkleOnSpy).toHaveBeenCalled();
      expect(sparkleOffSpy).toHaveBeenCalled();
      done();
    });
  });

  it('should correctly check unique name', (done) => {
    fetchMock.getOnce('/api/tenants?filter[]=ancestry=1&filter[]=name=&expand=resources', {
      resources: [],
    });
    fetchMock.getOnce('/api/tenants?filter[]=ancestry=1&filter[]=name=foo&expand=resources', {
      resources: [{
        id: 12345,
        name: 'foo',
      }],
    });
    fetchMock.getOnce('/api/tenants?filter[]=ancestry=1&filter[]=name=unique&expand=resources', {
      resources: [{
        id: 12345,
        name: 'foo',
      }],
    });
    const wrapper = mount(<OpsTenantForm {...initialProps} ancestry={1} />);
    /**
     * first empty validation
     */
    setTimeout(() => {
      wrapper.update();
      wrapper.find('input').first().simulate('change', { target: { value: 'foo' } });
      wrapper.update();
      /**
       * second validation with taken value
       */
      setTimeout(() => {
        wrapper.update();
        wrapper.update();
        expect(wrapper.find('.form-group').first().instance().className).toEqual('form-group has-error');
        wrapper.find('input').first().simulate('change', { target: { value: 'unique' } });
        wrapper.update();
        setTimeout(() => {
          expect(wrapper.find('.form-group').first().instance().className).toEqual('form-group');
          done();
        }, 500);
      }, 500);
    }, 500);
  });

  it('should render configuration which and change name isDisabled property', (done) => {
    fetchMock.getOnce('/api/tenants/123?expand=resources&attributes=name,description,use_config_for_attributes,ancestry', {
      name: 'foo',
      description: 'bar',
      ancestry: null,
      use_config_for_attributes: true,
    });
    fetchMock.getOnce('/api/tenants?filter[]=ancestry=null&filter[]=name=foo&expand=resources', {
      resources: [],
    });
    const wrapper = mount(<OpsTenantForm {...initialProps} recordId={123} />);
    /**
     * mount
     */
    setTimeout(() => {
      wrapper.update();
      const pfSwitch = wrapper.find('.pf3-switch');
      expect(wrapper.find('input').first().props().disabled).toEqual(true);
      expect(pfSwitch).toHaveLength(1);
      pfSwitch.find('input').simulate('change', { target: { checked: false } });
      wrapper.update();
      expect(wrapper.find('input').first().props().disabled).toEqual(false);
      done();
    }, 500);
  });

  it('should call addFlash when reseting edit form', (done) => {
    fetchMock.getOnce('/api/tenants/123?expand=resources&attributes=name,description,use_config_for_attributes,ancestry', {
      name: 'foo',
      description: 'bar',
      ancestry: null,
      use_config_for_attributes: true,
    });
    fetchMock.getOnce('/api/tenants?filter[]=ancestry=null&filter[]=name=foo&expand=resources', {
      resources: [],
    });
    const wrapper = mount(<OpsTenantForm {...initialProps} recordId={123} />);
    /**
     * mount
     */
    setTimeout(() => {
      wrapper.update();
      wrapper.find('input').first().simulate('change', { target: { value: 'bar' } });
      wrapper.update();
      wrapper.find('button').at(1).simulate('click');
      expect(flashSpy).toHaveBeenCalledWith('All changes have been reset', 'warning');
      done();
    }, 500);
  });

  it('should call miqRedirectBack when canceling form', (done) => {
    fetchMock.getOnce('/api/tenants?filter[]=ancestry=null&filter[]=name=&expand=resources', {
      resources: [],
    });
    const wrapper = mount(<OpsTenantForm {...initialProps} />);
    wrapper.find('button').last().simulate('click');
    expect(flashLaterSpy).toHaveBeenCalledWith({ level: 'warning', message: 'Creation of new Project was canceled by the user.' });
    done();
  });

  it('should correctly add new entity.', (done) => {
    fetchMock.getOnce('/api/tenants?filter[]=ancestry=undefined&filter[]=name=foo&expand=resources', {
      resources: [],
    });
    fetchMock.postOnce('/api/tenants', {});
    fetchMock.postOnce('/ops/invalidate_miq_product_feature_caches', {});
    const wrapper = mount(<OpsTenantForm {...initialProps} />);
    wrapper.find('input').at(0).simulate('change', { target: { value: 'foo' } });
    wrapper.find('input').at(1).simulate('change', { target: { value: 'bar' } });
    wrapper.update();
    setTimeout(() => {
      wrapper.find('button').first().simulate('click');
      setTimeout(() => {
        expect(JSON.parse(fetchMock.calls()[1][1].body)).toEqual({
          name: 'foo',
          description: 'bar',
          divisible: false,
          parent: { id: null },
        });
        expect(flashLaterSpy).toHaveBeenCalledWith({ level: 'success', message: 'Project "foo" has been successfully added.' });
        done();
      }, 500);
    }, 500);
  });

  it('should correctly edit existing entity.', (done) => {
    fetchMock.getOnce('/api/tenants/123?expand=resources&attributes=name,description,use_config_for_attributes,ancestry', {
      name: 'foo',
      description: 'bar',
      ancestry: null,
      use_config_for_attributes: true,
    });
    fetchMock.getOnce('/api/tenants?filter[]=ancestry=null&filter[]=name=foo&expand=resources', {
      resources: [],
    });
    fetchMock.putOnce('/api/tenants/123', {});
    fetchMock.postOnce('/ops/invalidate_miq_product_feature_caches', {});
    const wrapper = mount(<OpsTenantForm {...initialProps} recordId={123} />);
    wrapper.update();
    setTimeout(() => {
      wrapper.update();
      wrapper.find('input').at(1).simulate('change', { target: { value: 'desc' } });
      wrapper.update();
      setTimeout(() => {
        wrapper.find('button').first().simulate('click');
        setTimeout(() => {
          expect(JSON.parse(fetchMock.calls()[2][1].body)).toEqual({
            name: 'foo',
            description: 'desc',
            divisible: false,
            use_config_for_attributes: true,
          });
          expect(flashLaterSpy).toHaveBeenCalledWith({ level: 'success', message: 'Project "foo" has been successfully saved.' });
          done();
        }, 500);
      }, 500);
    }, 500);
  });
});
