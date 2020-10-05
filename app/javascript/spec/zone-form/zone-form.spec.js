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

    it('should render a new Zone form', (done) => {
        fetchMock.mock('/api/zones',zone)
        const wrapper = shallow(<ZoneForm/>);
        setImmediate(() => {
          wrapper.update();
          expect(toJson(wrapper)).toMatchSnapshot();
          done();
        });
      });

    
      it('should render editing a zone', async(done) => {
        fetchMock.once('/api/zones', zone);
        fetchMock.get('/api/zones/5124', zone);
        let wrapper;
    
        await act(async() => {
          wrapper = mount(<zone recordId={5124}/>);
        });
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        done();
      });
    
});