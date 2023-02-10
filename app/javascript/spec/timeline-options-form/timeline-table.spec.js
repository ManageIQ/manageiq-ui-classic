import React from 'react';
import toJson from 'enzyme-to-json';
import { act } from 'react-dom/test-utils';
import TimelineTable from '../../components/timeline-options/timeline-table';
import { mount } from '../helpers/mountForm';
import { tableSampleData } from './sample-table-data';

describe('Show Timeline Page', () => {
/*
 * Render Page
 */

  it('should render empty page', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<TimelineTable />);
    });
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render a table with data', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<TimelineTable data={tableSampleData} />);
    });
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });
});
