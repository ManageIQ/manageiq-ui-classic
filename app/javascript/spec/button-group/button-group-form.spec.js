import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import GroupForm from '../../components/button-group';

require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('Button Group form component', () => {
    let submitSpy;
    beforeEach(() => {
        submitSpy = jest.spyOn(window, 'miqAjaxButton');
    });
    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
        submitSpy.mockRestore();
    });

    it('should render the adding form', () => {
        const wrapper = shallow(<GroupForm available_fields={[]} fields={[]} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render the editing form', async(done) => {
        const expectedResult = {
            description: 'OP VM Group',
            group_id: null,
            id: '42',
            mode: null,
            name: 'OP VM Group|Vm|',
            set_data: {
                button_color: '#ed1a21',
                button_icon: 'pficon pficon-cluster',
                button_order: [15],
                display: true,
                group_index: 3,
                set_type: 'CustomButtonSet',
                applies_to_class: ''
                }
        }
        fetchMock.getOnce('api/custom_button_sets/42', {});
        fetchMock.postOnce('/api/custom_button_sets/42', expectedResult);
        let wrapper;
        await act(async() => {
        wrapper = mount(<GroupForm rec_id={42} available_fields={[]} fields={[]} url={''}/>);
        });
        expect(fetchMock.called('/api/custom_button_sets/42')).toBe(true);
        expect(toJson(wrapper)).toMatchSnapshot();
        done();
    });

});

