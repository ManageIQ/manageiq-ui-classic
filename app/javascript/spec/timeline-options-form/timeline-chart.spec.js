import React from 'react';
import toJson from 'enzyme-to-json';
import { act } from 'react-dom/test-utils';
import TimelineChart from '../../components/timeline-options/timeline-chart';
import { mount } from '../helpers/mountForm';

describe('Show Timeline Chart', () => {
  it('should render empty chart', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<TimelineChart />);
    });
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });
});
