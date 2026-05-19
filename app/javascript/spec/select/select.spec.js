import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  FormRenderer,
  useFormApi,
} from '@data-driven-forms/react-form-renderer';
import { FormTemplate } from '@data-driven-forms/carbon-component-mapper';
import Select from '../../components/select';

const DummyComponent = () => <div />;
const FormApiComponent = () => {
  const formOptions = useFormApi();
  return <DummyComponent {...formOptions} />;
};

// eslint-disable-next-line react/prop-types
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
        },
      ],
    }}
  />
);

describe('Select component', () => {
  it('should match the snapshot', () => {
    const { container } = render(<RendererWrapper />);

    expect(screen.getByLabelText('Choose')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should call onChange when changed', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<RendererWrapper onChange={onChange} />);

    const select = screen.getByLabelText('Choose');
    await user.selectOptions(select, '2');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('2');
    });
  });
});
