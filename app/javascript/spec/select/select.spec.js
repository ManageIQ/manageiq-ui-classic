import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import FormRenderer from '@data-driven-forms/react-form-renderer';
import { FormTemplate } from '@data-driven-forms/pf3-component-mapper';
import Select from '../../components/select';

const RendererWrapper = ({ onChange }) => (
  <FormRenderer
    onSubmit={ () => {} }
    FormTemplate={ FormTemplate }
    componentMapper={{
      'select': Select,
    }}
    schema={{
      fields: [{
        component: 'select',
        name: 'selectField',
        label: 'Choose',
        options: [
          {
            "label": "Dogs",
            "value": "1"
          },
          {
            "label": "Cats",
            "value": "2"
          },
        ],
        onChange,
      }],
    }}
  />
);

describe('Select component', () => {
  it('should match the snapshot', () => {
    const wrapper = mount(<RendererWrapper/>);
    expect(toJson(wrapper.find(Select))).toMatchSnapshot();
  });

  it('should call onChange when changed', async(done) => {
    const onChange = jest.fn();
    const wrapper = mount(<RendererWrapper onChange={ onChange }/>);

    await act(async() => {
      const component = wrapper.find('SelectWithOnChange Select').at(2);
      component.prop('onChange')("2");
    });

    expect(onChange).toHaveBeenCalled();
    done();
  });
});
