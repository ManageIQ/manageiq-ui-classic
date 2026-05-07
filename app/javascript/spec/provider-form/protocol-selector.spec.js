import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  FormRenderer,
  useFormApi,
} from '@data-driven-forms/react-form-renderer';
import {
  FormTemplate,
  componentMapper,
} from '@data-driven-forms/carbon-component-mapper';
import ProtocolSelector from '../../components/provider-form/protocol-selector';
import EditingContext from '../../components/provider-form/editing-context';

const DummyComponent = () => <div />;
const FormApiComponent = () => {
  const formOptions = useFormApi();
  return <DummyComponent {...formOptions} />;
};

const RendererWrapper = (props) => (
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
    const { container } = render(<RendererWrapper />);
    expect(container).toMatchSnapshot();
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

  it('should render correct form fields initially', async() => {
    const { container } = render(
      <RendererWrapper initialValues={initialValues} />
    );

    await waitFor(() => {
      expect(
        container.querySelector('select[name="type"]')
      ).toBeInTheDocument();
    });

    expect(container.querySelector('select[name="type"]').value).toEqual('stf');
    expect(
      container.querySelector('input[name="endpoints.stf.host"]').value
    ).toEqual('localhost');
    expect(
      container.querySelector('input[name="authentications.stf.username"]')
        .value
    ).toEqual('Bob Smith');
    expect(
      container.querySelector('input[name="endpoints.amqp.host"]')
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('input[name="authentications.amqp.username"]')
    ).not.toBeInTheDocument();
  });

  it('should render correct form fields on change', async() => {
    const { container } = render(
      <RendererWrapper initialValues={initialValues} />
    );
    const user = userEvent.setup();

    await waitFor(() => {
      expect(
        container.querySelector('select[name="type"]')
      ).toBeInTheDocument();
    });

    const typeSelect = container.querySelector('select[name="type"]');
    await user.selectOptions(typeSelect, 'amqp');

    await waitFor(() => {
      expect(container.querySelector('select[name="type"]').value).toEqual(
        'amqp'
      );
    });

    expect(
      container.querySelector('input[name="endpoints.amqp.host"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('input[name="authentications.amqp.username"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('input[name="endpoints.stf.host"]')
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('input[name="authentications.stf.username"]')
    ).not.toBeInTheDocument();
  });
});
