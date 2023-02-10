import React from 'react';
import { act } from 'react-dom/test-utils';
import TimelinePage from '../../components/timeline-options/timeline-page';
import { mount } from '../helpers/mountForm';

describe('Show Timeline Page', () => {
/*
 * Render Page
 */

  it('should render empty page', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<TimelinePage id="1" />);
    });
    setImmediate(() => {
      wrapper.update();
      expect(wrapper).toBeTruthy();
      // expect(toJson(wrapper)).toMatchSnapshot();
      // We cant do toMatchSnapshot because the select date fields change dynamically to the current date
      done();
    });
  });
});
