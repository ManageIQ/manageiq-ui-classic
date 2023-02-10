import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import { Button, Select } from 'carbon-components-react';
import TimelineOptions from '../../components/timeline-options/timeline-options';
import { sampleReponse, sampleSubmitPressedValues, sampleVmData } from './sample-data';
import { mount, shallow } from '../helpers/mountForm';
import mapper from '../../forms/mappers/componentMapper';
import '../../oldjs/miq_application'; // for miqJqueryRequest

describe('Show Timeline Options form component', () => {
  let submitSpy;

  const dummySubmitChosenFormOptions = (dummyValue) => { };

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
      wrapper = mount(<TimelineOptions submitChosenFormOptions={dummySubmitChosenFormOptions} />);
    });
    setImmediate(() => {
      wrapper.update();
      expect(wrapper.find(Select)).toHaveLength(1);
      expect(wrapper.find(Button)).toHaveLength(1);
      expect(wrapper.find(mapper['date-picker'])).toHaveLength(2);
      // expect(toJson(wrapper)).toMatchSnapshot();
      // We cant do toMatchSnapshot because the select date fields change dynamically to the current date
      done();
    });
  });

  /*
 * Submit Logic
 */

  it('should not submit values when form is empty', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<TimelineOptions submitChosenFormOptions={dummySubmitChosenFormOptions} />);
    });
    setImmediate(() => {
      wrapper.update();
      expect(wrapper.find(Button)).toHaveLength(1);
      wrapper.find(Button).first().simulate('click');
      expect(submitSpy).toHaveBeenCalledTimes(0);
      done();
    });
  });
});
