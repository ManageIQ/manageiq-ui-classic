import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';

import FlavorForm from '../../components/flavor-form';
import { mount } from '../helpers/mountForm';

describe('Flavor form component', () => {
  const emsUrl = '/api/providers?expand=resources&attributes=id,name,supports_create_flavor&filter[]=supports_create_flavor=true';

  const emsList = {
    resources: [
      { name: 'foo', id: 1 },
      { name: 'bar', id: 2 },
    ],
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('matches the snapshot', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = shallow(<FlavorForm redirect="" />);
    });

    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();

    done();
  });

  it('loads providers via the API', async(done) => {
    fetchMock.get(emsUrl, emsList);

    let wrapper;
    await act(async() => {
      wrapper = mount(<FlavorForm redirect="" />);
    });

    wrapper.update();
    expect(fetchMock.called(emsUrl)).toBe(true);

    done();
  });
});
