import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import FlavorForm from '../../components/flavor-form/flavor-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import '../helpers/mockAsyncRequest';
import '../helpers/miqSparkle';
import '../helpers/miqAjaxButton';
import '../helpers/miqFlashLater';
import { mount } from '../helpers/mountForm';

describe('Flavor form component', () => {
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;
  const emsList = {
    ems_list: [
      { name: 'name1', id: 1 },
      { name: 'name2', id: 2 },
    ],
  };
  const cloudTenants = {
    cloud_tenants: [
      { name: 'name3', id: 3 },
      { name: 'name4', id: 4 },
    ],
  };

  beforeEach(() => {
    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
  });

  it('should render form', (done) => {
    fetchMock
      .mock('/flavor/ems_list', emsList)
      .mock('/flavor/cloud_tenants', cloudTenants);
    const wrapper = shallow(<FlavorForm />);
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should call cancel callback ', (done) => {
    fetchMock
      .mock('/flavor/ems_list', emsList)
      .mock('/flavor/cloud_tenants', cloudTenants);
    const wrapper = mount(<FlavorForm />);
    const message = __('Add of Flavor cancelled by user.');
    const url = '/flavor/show_list';

    setImmediate(() => {
      wrapper.update();
      const button = wrapper.find('button').last();
      button.simulate('click');
      expect(submitSpyMiqSparkleOn).toHaveBeenCalled();
      expect(miqRedirectBack).toHaveBeenCalledWith(message, 'warn', url);
      done();
    });
  });

  it('should request data after mount and set to state', (done) => {
    fetchMock
      .mock('/flavor/ems_list', emsList)
      .mock('/flavor/cloud_tenants', cloudTenants);
    const wrapper = mount(<FlavorForm />);

    expect(submitSpyMiqSparkleOn).toHaveBeenCalled();
    expect(fetchMock.called('/flavor/ems_list')).toBeTruthy();
    expect(fetchMock.called('/flavor/cloud_tenants')).toBeTruthy();

    setImmediate(() => {
      wrapper.update();
      expect(wrapper.children().state().initialValues).toEqual({
        ems_id: 1,
        is_public: true,
        rxtx_factor: '1.0',
      });
      expect(wrapper.children().state().emsList).toEqual([
        { name: 'name1', id: 1 },
        { name: 'name2', id: 2 },
      ]);
      expect(wrapper.children().state().cloudTenants).toEqual([
        { label: 'name3', value: 3 },
        { label: 'name4', value: 4 },
      ]);
      expect(submitSpyMiqSparkleOff).toHaveBeenCalled();
      done();
    });
  });

  it('should not submit values when form is not valid', (done) => {
    fetchMock
      .mock('/flavor/ems_list', emsList)
      .mock('/flavor/cloud_tenants', cloudTenants);

    const wrapper = mount(<FlavorForm />);
    const spy = jest.spyOn(wrapper.children().instance(), 'submitValues');

    setImmediate(() => {
      wrapper.update();
      const form = wrapper.find('form');
      form.simulate('submit');
      expect(spy).toHaveBeenCalledTimes(0);
      done();
    });
  });

  it('should submit values when form is valid', (done) => {
    fetchMock
      .mock('/flavor/ems_list', emsList)
      .mock('/flavor/cloud_tenants', cloudTenants);

    const wrapper = mount(<FlavorForm />);
    wrapper.children().instance().submitValues = jest.fn();

    const spySubmit = jest.spyOn(wrapper.children().instance(), 'submitValues');

    setImmediate(() => {
      wrapper.update();
      wrapper.find('#ems_id').first().simulate('change', {
        target: {
          value: '1',
        },
      });
      wrapper.find('#disk').first().simulate('change', {
        target: {
          value: '1',
        },
      });
      wrapper.find('#name').first().simulate('change', {
        target: {
          value: 'name',
        },
      });
      wrapper.find('#ram').first().simulate('change', {
        target: {
          value: '1',
        },
      });
      wrapper.find('#vcpus').first().simulate('change', {
        target: {
          value: '1',
        },
      });
      wrapper.find('#swap').first().simulate('change', {
        target: {
          value: '1',
        },
      });

      // Click on submit button
      wrapper.find('form').simulate('submit');
      expect(spySubmit).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('nonError sends right message', () => {
    const wrapper = mount(<FlavorForm />);
    wrapper.children().instance().nonError('Flavor1');
    expect(miqRedirectBack).toHaveBeenCalledWith(
      __('Add of Flavor "Flavor1" was successfully initialized.'),
      'success',
      '/flavor/show_list',
    );
  });

  it('onError sends right message', () => {
    const wrapper = mount(<FlavorForm />);
    wrapper.children().instance().onError({
      results: [
        {
          message: 'Name too short!',
        },
      ],
    }, 'Flavor1');
    expect(miqRedirectBack).toHaveBeenCalledWith(
      __('Unable to add Flavor Flavor1 . Name too short!'),
      'error',
      '/flavor/show_list',
    );
    expect(submitSpyMiqSparkleOff).toHaveBeenCalled();
  });

  describe('getBack', () => {
    it('when error calls onError', () => {
      const response = {
        results: [{
          message: 'Name too short',
          success: false,
        }],
      };
      const wrapper = mount(<FlavorForm />);
      const spyOnError = jest.spyOn(wrapper.children().instance(), 'onError');
      wrapper.children().instance().getBack(response, 'Flavor1');
      expect(spyOnError).toHaveBeenCalledWith(response, 'Flavor1');
    });

    it('when valid calls nonError', () => {
      const response = {
        results: [{
          message: 'Success!',
          success: true,
        }],
      };
      const wrapper = mount(<FlavorForm />);
      const spyNonError = jest.spyOn(wrapper.children().instance(), 'nonError');
      wrapper.children().instance().getBack(response, 'Flavor1');
      expect(spyNonError).toHaveBeenCalledWith('Flavor1');
    });
  });

  it('submitValues parses data and post to API', (done) => {
    fetchMock
      .postOnce('api/providers/1/flavors', {});
    fetchMock
      .getOnce('flavor/ems_list', emsList);
    fetchMock
      .getOnce('flavor/cloud_tenants', cloudTenants);
    const wrapper = mount(<FlavorForm />);
    const spyGetBack = jest.spyOn(wrapper.children().instance(), 'getBack');
    const values = {
      name: 'Some name',
      ems_id: '1',
    };
    wrapper.children().instance().setState({
      is_public: true,
      emsList: [
        { id: 1, name: 'EmsName' },
      ],
    });
    wrapper.children().instance().submitValues(values).then(() => {
      expect(spyGetBack).toHaveBeenCalled();
      done();
    });
  });
});
