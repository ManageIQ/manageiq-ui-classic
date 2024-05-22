import React from 'react';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import CopyDashboardForm from '../../components/copy-dashboard-form/copy-dashboard-form';

import '../helpers/miqSparkle';
import '../helpers/miqAjaxButton';
import MiqFormRenderer from '../../forms/data-driven-form';
import * as handleFailure from '../../helpers/handle-failure';
import { mount } from '../helpers/mountForm';

describe('Copy Dashboard form', () => {
  let initialProps;
  let baseUrl;
  let apiUrl;
  let dashboardData;
  let apiData;
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;
  let spyMiqAjaxButton;

  beforeEach(() => {
    initialProps = { dashboardId: '55' };

    dashboardData = {
      name: 'Clint',
      description: 'good dashboard',
      owner_id: '12',
    };

    apiData = {
      resources: [
        { description: 'name1', id: '1' },
        { description: '80s', id: '80s' },
        { description: 'current group', id: '12' },
      ],
    };

    baseUrl = `/report/dashboard_get/${initialProps.dashboardId}`;

    apiUrl = '/api/groups?expand=resources';

    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
    spyMiqAjaxButton = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    fetchMock.restore();

    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
    spyMiqAjaxButton.mockRestore();
  });

  it('should render correctly and set initialValue', async(done) => {
    fetchMock
      .getOnce(baseUrl, dashboardData)
      .getOnce(apiUrl, apiData)
      .getOnce('/report/dashboard_get/55?name=Clint', { length: 1 });

    let wrapper;
    await act(async() => {
      wrapper = mount(<CopyDashboardForm {...initialProps} />);
    });

    wrapper.update();
    expect(wrapper.find(MiqFormRenderer)).toHaveLength(1);
    expect(wrapper.find('input[name="name"]').instance().value).toEqual('Clint');
    expect(wrapper.find('input[name="description"]').instance().value).toEqual('good dashboard');
    expect(submitSpyMiqSparkleOn).toHaveBeenCalledTimes(1);
    expect(submitSpyMiqSparkleOff).toHaveBeenCalledTimes(1);
    done();
  });

  it('should handle error', async(done) => {
    const original = console.error;
    console.error = jest.fn();

    fetchMock
      .getOnce(baseUrl, dashboardData)
      .getOnce(apiUrl, { body: {}, status: 400 })
      .getOnce('/report/dashboard_get/55?name=Clint', { length: 1 });

    handleFailure.default = jest.fn();
    let wrapper;
    await act(async() => {
      wrapper = mount(<CopyDashboardForm {...initialProps} />);
    });

    wrapper.update();
    expect(handleFailure.default).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    console.error = original;
    done();
  });

  it('should handle cancel', async(done) => {
    fetchMock
      .getOnce(baseUrl, dashboardData)
      .getOnce(apiUrl, apiData)
      .getOnce('/report/dashboard_get/55?name=Clint', { length: 1 });
    let wrapper;

    await act(async() => {
      wrapper = mount(<CopyDashboardForm {...initialProps} />);
    });

    wrapper.update();
    wrapper.find('button.bx--btn--secondary').last().simulate('click'); // click on cancel
    expect(submitSpyMiqSparkleOn).toHaveBeenCalledTimes(2);
    expect(spyMiqAjaxButton).toHaveBeenCalledWith('/report/db_copy/55?button=cancel');
    done();
  });

  it('should handle submit', async() => {
    fetchMock
      .getOnce(baseUrl, dashboardData)
      .getOnce(apiUrl, apiData)
      .postOnce('/report/db_copy/55?button=save', { name: 'original_name' })
      .getOnce('/report/dashboard_get/55?name=Clint', { length: 0 })
      .getOnce('/report/dashboard_get/55?name=new_name', { length: 0 });

    let wrapper;
    await act(async() => {
      wrapper = mount(<CopyDashboardForm {...initialProps} />);
    });

    wrapper.update();

    expect(fetchMock.calls()).toHaveLength(2);

    await act(async() => {
      wrapper.find('input[name="name"]').simulate('change', { target: { value: 'new_name' } });
      wrapper.find('input[name="group_id"]').simulate('change', { target: { value: '80s' } });
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    wrapper.update();

    await act(async() => {
      setTimeout(() => {
        expect(spyMiqAjaxButton).toHaveBeenCalledWith(
          '/report/dashboard_render',
          { group: 'current group', name: 'new_name', original_name: 'original_name' },
        );
        expect(fetchMock.calls()).toHaveLength(4);
      }, 500);
    });
  });
});
