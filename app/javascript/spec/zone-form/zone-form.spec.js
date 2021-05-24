import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';

import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import ZoneForm from '../../components/zone-form/index';


const zoneForm = require('../../components/zone-form/index');
describe('zone Form Component', () => {
  const zone = {
    authentications: [],
    created_on: '2021-05-13T19:47:24Z',
    description: 'test add zone',
    href: 'http://localhost:3000/api/zones/68',
    id: "68",
    name: 'test add zone name',
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render a new Zone form', async(done) => {
    const wrapper = shallow(<ZoneForm />);
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render editing a zone form', async(done) => {
    fetchMock.get('/api/zones/68?attributes=authentications', zone);
    let wrapper;
    await act(async() => {
      wrapper = mount(<ZoneForm recordId={68} {...zone} />);
    });
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('input[name="name"]').instance().value).toEqual('test add zone name');
    expect(wrapper.find('input[name="description"]').instance().value).toEqual('test add zone');
    done();
  });
});