import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import { Button } from 'carbon-components-react';
import HostEditForm from '../../components/host-edit-form/host-edit-form';
import { samepleInitialValues, sampleSingleReponse, sampleMultiResponse } from './helper-data';

import { mount, shallow } from '../helpers/mountForm';
import '../../oldjs/miq_application'; // for miqJqueryRequest
import '../helpers/miqSparkle';

describe('Show Edit Host Form Component', () => {
  let submitSpy;

  const id = [1];
  const ids = [1, 2, 3];

  beforeEach(() => {
    // fetchMock
    //   .once('/api/event_streams', sampleReponse);
    // submitSpy = jest.spyOn(window, 'miqJqueryRequest');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    // submitSpy.mockRestore();
  });

  /*
 * Render Form
 */

  it('should render form for *one* host', async(done) => {
    let wrapper;
    fetchMock
      .get(`/api/hosts/${id[0]}?expand=resources&attributes=authentications`, samepleInitialValues)
      .mock(`/api/hosts/${id[0]}`, sampleSingleReponse);
    await act(async() => {
      wrapper = mount(<HostEditForm ids={id} />);
    });
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render form for multiple hosts', async(done) => {
    let wrapper;
    fetchMock.get(`/api/hosts?expand=resources&attributes=id,name&filter[]=id=[${ids}]`, sampleMultiResponse);
    await act(async() => {
      wrapper = mount(<HostEditForm ids={ids} />);
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

//   it('should not submit values when form is empty', async(done) => {
//     let wrapper;
//     await act(async() => {
//       wrapper = mount(<TimelineOptions url="sample/url" />);
//     });
//     setImmediate(() => {
//       wrapper.update();
//       expect(wrapper.find(Button)).toHaveLength(1);
//       wrapper.find(Button).first().simulate('click');
//       expect(submitSpy).toHaveBeenCalledTimes(0);
//       done();
//     });
//   });
});
