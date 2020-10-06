import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';

import ZoneForm from '../../components/zone-form/index';
import { mount } from '../helpers/mountForm';
import { act } from 'react-dom/test-utils';

const zoneForm = require('../../components/zone-form/index');
describe('zone Form Component', () => {

    const zone = {
        authentications: [],
        created_on: "2020-09-24T17:19:12Z",
        description: "test 23",
        href: "http://localhost:3000/api/zones/5124",
        id: "5124",
        name: "tes 23",
    }

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
    
      it('should render editing a zone', async(done) => {
        fetchMock.get('/api/zones/5124', zone);
        let wrapper;
        await act(async() => {
          wrapper = mount(<ZoneForm recordId={5124} {...zone}/>);
        });
        // const form = wrapper.find('form');
        // expect(form.find('input[name="name"]')).toEqual("tes 23");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        // expect(wrapper.find('input[name="name"]').instance().value).toEqual('tes 23');
        // expect(wrapper.find('input[name="description"]').instance().value).toEqual('test 23');
        done();
      });
});
