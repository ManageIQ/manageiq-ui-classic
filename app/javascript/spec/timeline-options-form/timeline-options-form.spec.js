import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import TimelineOptions from '../../components/timeline-options/timeline-options';
import { sampleReponse, sampleSubmitPressedValues, sampleVmData } from './sample-data';
import { mount, shallow } from '../helpers/mountForm';
import { Button } from 'carbon-components-react';
import '../../oldjs/miq_application' // for miqJqueryRequest

describe('Show Timeline Options form component', () => {
  let submitSpy;

  beforeEach(() => {
    fetchMock
      .once('/api/event_streams', sampleReponse);
    submitSpy = jest.spyOn(window, 'miqJqueryRequest');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });

  /*
 * Render Form
 */

  it('should render form', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<TimelineOptions url="sample/url" />);
    });
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  /*
 * Submit Logic
 */

  it('should not submit values when form is empty', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<TimelineOptions url="sample/url" />);
    });
    setImmediate(() => {
      wrapper.update();
      expect(wrapper.find(Button)).toHaveLength(2);
      wrapper.find(Button).first().simulate('click');
      expect(submitSpy).toHaveBeenCalledTimes(0);
      done();
    });
  });
});
