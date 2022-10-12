import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import TimelineOptions from '../../components/timeline-options/timeline-options';
import { sampleReponse, sampleSubmitPressedValues } from './sample-data';

// TODO Snapshots look incorrect

describe('Show Timeline Options form component', () => {
  beforeEach(() => {
    fetchMock
      .once('/api/event_streams', sampleReponse);
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  // TODO:
  const sampleUrl = `/api/event_streams?limit=5000&offset=0&expand=resources&attributes=group,group_level,group_name,id,event_type,message,ems_id,type,timestamp,created_on&filter[]=type=EmsEvent&filter[]=timestamp>2022-09-07T04:00:00.000Z&filter[]=timestamp<2022-09-28T04:00:00.000Z`;

  /*
 * Render Form
 */

  it('should render form', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = shallow(<TimelineOptions />);
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

  it('should submit and render table', async(done) => {
    fetchMock.postOnce(sampleUrl, sampleSubmitPressedValues);
    let wrapper;
    await act(async() => {
      wrapper = shallow(<TimelineOptions />);
    });
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
