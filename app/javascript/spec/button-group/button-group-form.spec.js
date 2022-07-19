import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import GroupForm from '../../components/button-group';

require('../helpers/miqSparkle');
require('../helpers/miqAjaxButton');

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
    const wrapper = shallow(<GroupForm availableFields={[]} fields={[]} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render the adding form for generic object button groups', () => {
    const wrapper = shallow(<GroupForm url="/generic_object_definition/" appliesToId={6} appliesToClass="GenericObjectDefinition" isGenericObject />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  // eslint-disable-next-line jest/no-done-callback
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
        applies_to_class: '',
      },
    };
    fetchMock.getOnce('api/custom_button_sets/42', {});
    fetchMock.postOnce('/api/custom_button_sets/42', expectedResult);
    let wrapper;
    await act(async() => {
      wrapper = mount(<GroupForm recId={42} availableFields={[]} fields={[]} url="" />);
    });
    expect(fetchMock.called('/api/custom_button_sets/42')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  // eslint-disable-next-line jest/no-done-callback
  it('should render the editing form for generic object button group', async(done) => {
    const expectedResult = {
      description: 'test',
      group_id: null,
      id: '219',
      mode: null,
      name: 'test group form',
      set_data: {
        button_color: 'ffffff',
        button_icon: 'pficon pficon-applications',
        button_order: [105, 106, 107],
        display: true,
        applies_to_class: 'GenericObjectDefinition',
        applies_to_id: '6',
      },
      set_type: 'CustomButtonSet',
    };
    fetchMock.getOnce('api/custom_button_sets/219', {});
    fetchMock.getOnce('/api/custom_buttons?expand=resources&filter[]=applies_to_class=GenericObjectDefinition&filter[]=applies_to_id=6', {});
    fetchMock.getOnce('/api/custom_button_sets?expand=resources&filter[]=owner_type=GenericObjectDefinition&filter[]=owner_id=6', {});
    fetchMock.postOnce('/api/custom_button_sets/219', expectedResult);
    let wrapper;
    await act(async() => {
      wrapper = mount(<GroupForm
        url="/generic_object_definition/"
        recId={219}
        appliesToId={6}
        appliesToClass="GenericObjectDefinition"
        isGenericObject
      />);
    });
    expect(fetchMock.called('/api/custom_button_sets/219')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
