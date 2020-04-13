import React from 'react';
import { act } from 'react-dom/test-utils';
import fetchMock from 'fetch-mock';
import { mount } from '../helpers/mountForm';
import RegionForm from '../../components/region-form';
import MiqFormRenderer from '../../forms/data-driven-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import '../helpers/miqSparkle';
import '../helpers/addFlash';
import '../helpers/miqFlashLater';

describe('RegionForm', () => {
  let initialProps;
  const sparkleOnSpy = jest.spyOn(window, 'miqSparkleOn');
  const sparkleOffSpy = jest.spyOn(window, 'miqSparkleOff');
  const flashSpy = jest.spyOn(window, 'add_flash');
  const flashLaterSpy = jest.spyOn(window, 'miqFlashLater');
  beforeEach(() => {
    initialProps = {
      id: '123',
      maxDescLen: 50,
    };
  });

  afterEach(() => {
    fetchMock.reset();
    sparkleOnSpy.mockReset();
    sparkleOffSpy.mockReset();
    flashSpy.mockReset();
    flashLaterSpy.mockReset();
  });

  it('should mount and set initialValues', async(done) => {
    fetchMock.getOnce('/api/regions/123?attributes=description', {
      description: 'foo',
    });

    let wrapper;
    await act(async() => {
      wrapper = mount(<RegionForm {...initialProps} />);
    });
    wrapper.update();
    expect(wrapper.find(MiqFormRenderer).props().initialValues).toEqual({
      description: 'foo',
    });
    expect(fetchMock.calls()).toHaveLength(1);
    expect(sparkleOnSpy).toHaveBeenCalled();
    expect(sparkleOffSpy).toHaveBeenCalled();
    done();
  });

  it('should successfully call cancel', async(done) => {
    fetchMock.getOnce('/api/regions/123?attributes=description', {
      description: 'foo',
    });

    let wrapper;
    await act(async() => {
      wrapper = mount(<RegionForm {...initialProps} />);
    });
    wrapper.update();
    wrapper.find('button').last().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith('Edit of Region was cancelled by the user', 'success', '/ops/explorer/?button=cancel'); // eslint-disable-line max-len
    done();
  });

  it('should call addFlash when resetting edit form', async(done) => {
    fetchMock.getOnce('/api/regions/123?attributes=description', {
      description: 'foo',
    });

    let wrapper;
    await act(async() => {
      wrapper = mount(<RegionForm {...initialProps} />);
    });
    wrapper.update();
    wrapper.find('input').first().simulate('change', { target: { value: 'bar' } });
    wrapper.update();
    wrapper.find('button').at(1).simulate('click');
    expect(flashSpy).toHaveBeenCalledWith('All changes have been reset', 'warn');
    done();
  });

  it('should enable submit button and call submit callback', async(done) => {
    fetchMock
      .getOnce('/api/regions/123?attributes=description', {
        description: 'foo',
      })
      .postOnce('/api/regions/123', {});

    let wrapper;
    await act(async() => {
      wrapper = mount(<RegionForm {...initialProps} />);
    });
    wrapper.update();
    await act(async() => {
      wrapper.find('input').first().simulate('change', { target: { value: 'bar' } });
    });
    wrapper.update();
    setTimeout(async() => {
      await act(async() => {
        wrapper.find('form').simulate('submit');
      });
      expect(JSON.parse(fetchMock.calls()[1][1].body)).toEqual({
        "action": "edit",
        "resource": {
          "description": "bar",
        }
      });
      expect(miqRedirectBack).toHaveBeenCalledWith('Region was saved', 'success', '/ops/explorer/123?button=save'); // eslint-disable-line max-len
      done();
    }, 500);
  });
});
