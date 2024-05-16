import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import HostEditForm from '../../components/host-edit-form/host-edit-form';
import { sampleInitialValues, sampleSingleResponse, sampleMultiResponse } from './helper-data';

import { mount } from '../helpers/mountForm';
import '../../oldjs/miq_application'; // for miqJqueryRequest
import '../helpers/miqSparkle';

describe('Show Edit Host Form Component', () => {
  const id = [1];
  const ids = [1, 2, 3];

  beforeEach(() => {
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  /** Render Form */
  it('should render form for *one* host', async(done) => {
    let wrapper;
    await act(async() => {
      fetchMock
        .get(`/api/hosts/${id[0]}?expand=resources&attributes=authentications`, sampleInitialValues)
        .mock(`/api/hosts/${id[0]}`, sampleSingleResponse);
      wrapper = mount(<HostEditForm ids={id} />);
    });

    // Wrap AsyncCredentials updates in act(...)
    await act(async() => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        done();
      });
    });
  });

  it('should render form for multiple hosts', async(done) => {
    let wrapper;
    await act(async() => {
      fetchMock.get(`/api/hosts?expand=resources&attributes=id,name&filter[]=id=[${ids}]`, sampleMultiResponse);
      wrapper = mount(<HostEditForm ids={ids} />);
    });

    // Wrap AsyncCredentials updates in act(...)
    await act(async() => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        done();
      });
    });
  });
});
