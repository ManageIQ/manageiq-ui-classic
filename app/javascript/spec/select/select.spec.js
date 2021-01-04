import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import FormRenderer, { useFormApi } from '@data-driven-forms/react-form-renderer';
import { FormTemplate } from '@data-driven-forms/pf3-component-mapper';
import Select from '../../components/select';

const DummyComponent = () => <div />;
const FormApiComponent = () => {
  const formOptions = useFormApi();
  return <DummyComponent {...formOptions} />;
};

const RendererWrapper = ({ onChange }) => (
  <FormRenderer
    onSubmit={() => {}}
    FormTemplate={FormTemplate}
    componentMapper={{
      select: Select,
      'form-api-component': FormApiComponent,
    }}
    schema={{
      fields: [
        {
          component: 'form-api-component',
          name: 'form-api',
        },
        {
          component: 'select',
          name: 'selectField',
          label: 'Choose',
          options: [
            {
              label: 'Dogs',
              value: '1',
            },
            {
              label: 'Cats',
              value: '2',
            },
          ],
          onChange,
        }],
    }}
  />
);

describe('Select component', () => {
  it('should match the snapshot', () => {
    const wrapper = mount(<RendererWrapper />);
    expect(toJson(wrapper.find(Select))).toMatchSnapshot();
  });

  it('should call onChange when changed', async(done) => {
    const onChange = jest.fn();
    const wrapper = mount(<RendererWrapper onChange={onChange} />);

    await act(async() => {
      wrapper.find('DummyComponent').prop('change')('selectField', '2');
    });

    expect(onChange).toHaveBeenCalled();
    done();
  });
});
