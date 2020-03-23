import React from 'react';
import { act } from 'react-dom/test-utils';
import fetchMock from 'fetch-mock';
import WorkersForm from '../../components/workers-form/workers-form';

import '../helpers/miqSparkle';
import '../helpers/addFlash';
import '../helpers/sprintf';
import MiqFormRenderer from '../../forms/data-driven-form';
import Dualgroup from '../../components/dual-group';
import { mount } from '../helpers/mountForm';

describe('Workers form', () => {
  let initialProps;
  let settingsData;
  let expectedValues;
  let baseUrl;
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;
  let spyAddFlash;

  beforeEach(() => {
    initialProps = {
      server: {
        id: 1,
        name: 'Server 1',
      },
      product: 'ManageIQ',
      zone: 'Default zone',
    };

    settingsData = {
      workers: {
        worker_base: {
          event_catcher: {
            defaults: {
              memory_threshold: '2.gigabytes',
            },
            memory_threshold: 2147483648,
          },
          queue_worker_base: {
            ems_metrics_collector_worker: {
              defaults: {
                count: 8, memory_threshold: 419430400,
              },
            },
            ems_refresh_worker: {
              defaults: {
                memory_threshold: 2147483648,
              },
            },
            defaults: {
              memory_threshold: '500.megabytes',
            },
            ems_metrics_processor_worker: {
              count: 2, memory_threshold: 629145600,
            },
            generic_worker: { count: 2, memory_threshold: 524288000 },
            priority_worker: {
              memory_threshold: 419430400, count: 2,
            },
            reporting_worker: { count: 2, memory_threshold: 524288000 },
            smart_proxy_worker: {
              count: 2, memory_threshold: 576716800,
            },
          },
          defaults: {
            count: 1, memory_threshold: '400.megabytes',
          },
          ui_worker: {
            memory_threshold: '1.gigabytes', count: 1,
          },
          web_service_worker: {
            connection_pool_size: 8, memory_threshold: 1073741824,
          },
          remote_console_worker: {
            memory_threshold: '1.gigabytes',
          },
        },
      },
    };

    expectedValues = {
      ems_metrics_collector_worker: { defaults: { count: 8, memory_threshold: 419430400 } },
      ems_metrics_processor_worker: { count: 2, memory_threshold: 629145600 },
      ems_refresh_worker: { defaults: { memory_threshold: 2147483648 } },
      event_catcher: { memory_threshold: 2147483648 },
      generic_worker: { count: 2, memory_threshold: 524288000 },
      priority_worker: { count: 2, memory_threshold: 419430400 },
      remote_console_worker: { count: 1 },
      reporting_worker: { count: 2, memory_threshold: 524288000 },
      smart_proxy_worker: { count: 2, memory_threshold: 576716800 },
      ui_worker: { count: 1 },
      web_service_worker: { count: 1, memory_threshold: 1073741824 },
    };

    baseUrl = `/api/servers/${initialProps.server.id}/settings`;

    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
    spyAddFlash = jest.spyOn(window, 'add_flash');
  });

  afterEach(() => {
    fetchMock.restore();

    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
    spyAddFlash.mockRestore();
  });

  it('should render correctly', async(done) => {
    fetchMock
      .getOnce(baseUrl, settingsData);

    let wrapper;
    await act(async() => {
      wrapper = mount(<WorkersForm {...initialProps} />);
    });

    wrapper.update();
    expect(wrapper.find(MiqFormRenderer)).toHaveLength(1);
    expect(wrapper.find(Dualgroup)).toHaveLength(6);
    done();
  });

  it('should render error when loading is broken', (done) => {
    fetchMock
      .getOnce(baseUrl, 500);

    const wrapper = mount(<WorkersForm {...initialProps} />);

    setImmediate(() => {
      wrapper.update();
      expect(wrapper.find(MiqFormRenderer)).toHaveLength(0);
      expect(wrapper.find(Dualgroup)).toHaveLength(0);
      expect(spyAddFlash).toHaveBeenCalledWith('Could not fetch the data', 'error');
      done();
    });
  });

  it('should request data after mount and set to state', async(done) => {
    fetchMock
      .getOnce(baseUrl, settingsData);

    let wrapper;
    await act(async() => {
      wrapper = mount(<WorkersForm {...initialProps} />);
    });

    wrapper.update();
    expect(submitSpyMiqSparkleOn).toHaveBeenCalled();
    expect(submitSpyMiqSparkleOff).toHaveBeenCalled();
    expect(fetchMock.called(baseUrl)).toBe(true);
    expect(fetchMock.calls()).toHaveLength(1);
    const { form } = wrapper.find(MiqFormRenderer).children().children().children()
      .instance();
    expect(form.getState().values).toEqual(expectedValues);
    done();
  });

  it('should send data in the patch format, show message and set initialValues', async(done) => {
    fetchMock
      .getOnce(baseUrl, settingsData);
    fetchMock
      .patchOnce(baseUrl, settingsData);

    let wrapper;
    await act(async() => {
      wrapper = mount(<WorkersForm {...initialProps} />);
    });
    wrapper.update();
    const { form } = wrapper.find(MiqFormRenderer).children().children().children()
      .instance();
    expect(fetchMock.calls()).toHaveLength(1);

    form.change('smart_proxy_worker.count', 1);

    wrapper.update();
    await act(async() => {
      wrapper.find('form').simulate('submit');
    });
    expect(fetchMock.calls()).toHaveLength(2);
    expect(fetchMock.lastCall()[1].body).toEqual(JSON.stringify({
      workers: {
        worker_base: {
          queue_worker_base: {
            smart_proxy_worker: {
              count: 1,
            },
          },
        },
      },
    }));
    expect(form.getState().initialValues).toEqual(
      { ...expectedValues, smart_proxy_worker: { ...expectedValues.smart_proxy_worker, count: 1 } },
    );
    expect(submitSpyMiqSparkleOn).toHaveBeenCalledTimes(2);
    expect(submitSpyMiqSparkleOff).toHaveBeenCalledTimes(2);
    expect(spyAddFlash).toHaveBeenCalledWith(`Configuration settings saved for ${initialProps.product} Server "${initialProps.server.name} [${initialProps.server.id}]" in Zone "${initialProps.zone}"`, 'success');
    done();
  });
});
