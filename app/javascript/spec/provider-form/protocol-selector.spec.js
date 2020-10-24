import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import FormRenderer, { useFormApi } from '@data-driven-forms/react-form-renderer';
import { FormTemplate, componentMapper } from '@data-driven-forms/pf3-component-mapper';
import ProtocolSelector from '../../components/provider-form/protocol-selector';
import { EditingContext } from '../../components/provider-form';

const DummyComponent = () => <div />;
const FormApiComponent = () => {
  const formOptions = useFormApi();
  return <DummyComponent {...formOptions} />;
};

const RendererWrapper = props => (
  <EditingContext.Provider value={{ providerId: true }}>
    <FormRenderer
      onSubmit={() => {}}
      FormTemplate={FormTemplate}
      componentMapper={{
        ...componentMapper,
        'protocol-selector': ProtocolSelector,
        'form-api-component': FormApiComponent,
      }}
      schema={{
        fields: [
          {
            component: 'form-api-component',
            name: 'form-api',
          },
          {
            component: 'protocol-selector',
            name: 'type',
            label: 'Type',
            options: [
              {
                label: 'STF',
                value: 'stf',
                pivot: 'endpoints.stf.host',
              },
              {
                label: 'AMQP',
                value: 'amqp',
                pivot: 'endponts.amqp.host',
              },
            ],
          },
          {
            component: 'text-field',
            name: 'endpoints.stf.host',
            label: 'hostname',
            condition: {
              when: 'type',
              is: 'stf',
            },
          },
          {
            component: 'text-field',
            name: 'endpoints.amqp.host',
            label: 'hostname',
            condition: {
              when: 'type',
              is: 'amqp',
            },
          },
          {
            component: 'text-field',
            name: 'authentications.stf.username',
            label: 'username',
            condition: {
              when: 'type',
              is: 'stf',
            },
          },
          {
            component: 'text-field',
            name: 'authentications.amqp.username',
            label: 'username',
            condition: {
              when: 'type',
              is: 'amqp',
            },
          },
        ],
      }}
      {...props}
    />
  </EditingContext.Provider>
);

describe('ProtocolSelector component', () => {
  it('should match the snapshot', () => {
    const wrapper = mount(<RendererWrapper />);
    expect(toJson(wrapper.find(ProtocolSelector))).toMatchSnapshot();
  });

  const initialValues = {
    endpoints: {
      stf: {
        host: 'localhost',
      },
    },
    authentications: {
      stf: {
        username: 'Bob Smith',
      },
    },
  };

  it('should render correct form fields initially', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<RendererWrapper initialValues={initialValues} />);
      wrapper.update();
    });

    expect(wrapper.find('input[name="type"]').prop('value')).toEqual('stf');
    expect(wrapper.find('input[name="endpoints.stf.host"]').prop('value')).toEqual('localhost');
    expect(wrapper.find('input[name="authentications.stf.username"]').prop('value')).toEqual('Bob Smith');
    expect(wrapper.contains('input[name="endpoints.amqp.host')).toBe(false);
    expect(wrapper.contains('input[name="authentications.amqp.username')).toBe(false);
    done();
  });

  it('should render correct form fields on change', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<RendererWrapper initialValues={initialValues} />);
    });

    await act(async() => {
      wrapper.find('DummyComponent').prop('change')('type', 'amqp');
    });

    wrapper.update();

    expect(wrapper.find('input[name="type"]').prop('value')).toEqual('amqp');
    expect(wrapper.exists('input[name="endpoints.amqp.host"]')).toBe(true);
    expect(wrapper.exists('input[name="authentications.amqp.username"]')).toBe(true);
    expect(wrapper.exists('input[name="endpoints.stf.host"]')).toBe(false);
    expect(wrapper.exists('input[name="authentications.stf.username"]')).toBe(false);
    done();
  });
});
