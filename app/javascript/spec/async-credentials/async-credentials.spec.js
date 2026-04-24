import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormRenderer } from '@data-driven-forms/react-form-renderer';
import { FormTemplate, componentMapper } from '@data-driven-forms/carbon-component-mapper';
import AsyncCredentials from '../../components/async-credentials/async-credentials';

const RendererWrapper = ({ asyncValidate, onSubmit, ...props }) => (
  <FormRenderer
    onSubmit={onSubmit}
    FormTemplate={FormTemplate}
    componentMapper={{
      ...componentMapper,
      'async-credentials': AsyncCredentials,
    }}
    schema={{
      fields: [
        {
          component: 'async-credentials',
          name: 'validate_credentials',
          asyncValidate,
          fields: [
            {
              component: 'text-field',
              name: 'foo',
              initialValue: 'bar',
            },
          ],
        },
      ],
    }}
    {...props}
  />
);

describe('Async credentials component', () => {
  it('should render correctly', async() => {
    const { container } = render(<RendererWrapper asyncValidate={() => {}} />);

    await waitFor(() => {
      expect(container.querySelector('input[name="foo"]')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should call async validation function on button click and set valid state to true', async() => {
    const user = userEvent.setup();
    const asyncValidate = jest.fn().mockReturnValue(new Promise((resolve) => resolve('Ok')));
    const onSubmit = jest.fn();

    const { container } = render(<RendererWrapper asyncValidate={asyncValidate} onSubmit={onSubmit} />);

    const input = container.querySelector('input[name="foo"]');
    const validateButton = container.querySelector('button[type="button"]');

    await user.clear(input);
    await user.type(input, 'baz');
    await user.click(validateButton);

    await waitFor(() => {
      expect(asyncValidate).toHaveBeenCalledWith(
        {
          foo: 'baz',
          validate_credentials: false,
        },
        ['foo']
      );
    });

    const form = container.querySelector('form');
    await user.click(form.querySelector('button[type="submit"]'));

    expect(onSubmit).toHaveBeenCalledWith({ foo: 'baz', validate_credentials: true }, expect.anything(), expect.anything());
  });

  it('should call async validation function on button click and set valid state to false', async() => {
    const user = userEvent.setup();
    // eslint-disable-next-line prefer-promise-reject-errors
    const asyncValidate = jest.fn(() => Promise.reject('Validation failed'));
    const onSubmit = jest.fn();

    const { container } = render(<RendererWrapper asyncValidate={asyncValidate} onSubmit={onSubmit} />);

    const input = container.querySelector('input[name="foo"]');
    const validateButton = container.querySelector('button[type="button"]');

    await user.clear(input);
    await user.type(input, 'baz');
    await user.click(validateButton);

    await waitFor(() => {
      expect(asyncValidate).toHaveBeenCalledWith(
        {
          foo: 'baz',
          validate_credentials: false,
        },
        ['foo']
      );
    });

    await waitFor(() => {
      expect(container.querySelector('div.ddorg__carbon-error-helper-text').textContent).toEqual('Validation failed');
    });
  });

  it('should correctly set invalid state after input change', async() => {
    const user = userEvent.setup();
    const asyncValidate = jest.fn().mockReturnValue(new Promise((resolve) => resolve('Ok')));
    const { container } = render(<RendererWrapper asyncValidate={asyncValidate} />);

    const input = container.querySelector('input[name="foo"]');
    const validateButton = container.querySelector('button[type="button"]');

    await user.clear(input);
    await user.type(input, 'baz');
    await user.click(validateButton);

    await waitFor(() => {
      expect(container.querySelector('div.cds--form__helper-text').textContent).toEqual('Validation successful');
    });

    await user.clear(input);
    await user.type(input, 'test');

    await waitFor(() => {
      expect(container.querySelector('div.cds--form__helper-text')).not.toBeInTheDocument();
    });
  });

  it('should correctly set valid state after input change if passed initial values', async() => {
    const user = userEvent.setup();
    const asyncValidate = jest.fn().mockReturnValue(new Promise((resolve) => resolve('Ok')));
    const { container } = render(<RendererWrapper asyncValidate={asyncValidate} />);

    const input = container.querySelector('input[name="foo"]');
    const validateButton = container.querySelector('button[type="button"]');

    await user.clear(input);
    await user.type(input, 'baz');
    await user.click(validateButton);

    await waitFor(() => {
      expect(container.querySelector('div.cds--form__helper-text').textContent).toEqual('Validation successful');
    });

    await user.clear(input);
    await user.type(input, 'test');

    await waitFor(() => {
      expect(container.querySelector('div.cds--form__helper-text')).not.toBeInTheDocument();
    });

    await user.clear(input);
    await user.type(input, 'baz');

    await waitFor(() => {
      expect(container.querySelector('div.cds--form__helper-text').textContent).toEqual('Validation successful');
    });
  });
});
