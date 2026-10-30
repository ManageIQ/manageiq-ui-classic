import { renderToStaticMarkup } from 'react-dom/server';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MiqFormRenderer from '@@ddf';

import { carbonizeIcon } from '../../menu/icon';
import { renderWithRedux } from '../helpers/mountForm';

const OPTIONS = [
  { label: 'String', value: 'string', 'data-icon': 'carbon--StringText' },
  { label: 'Integer', value: 'integer', 'data-icon': 'carbon--StringInteger' },
  { label: 'Plain', value: 'plain' },
];

const renderField = (fieldProps = {}, { initialValues, onSubmit = jest.fn(), extraFields = [] } = {}) => {
  const schema = {
    fields: [
      {
        component: 'select-with-icons',
        name: 'datatype',
        id: 'datatype',
        label: 'Data Type',
        options: OPTIONS,
        ...fieldProps,
      },
      ...extraFields,
    ],
  };

  const utils = renderWithRedux(
    <MiqFormRenderer
      schema={schema}
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  );
  return { ...utils, onSubmit };
};

const openList = (user) => user.click(document.querySelector('#datatype button.cds--list-box__field'));

describe('SelectWithIcons', () => {
  it('should match snapshot', () => {
    const { container } = renderField();
    expect(container).toMatchSnapshot();
  });

  it('renders the label and the placeholder when nothing is selected', () => {
    renderField();

    expect(screen.getByText('Data Type')).toBeInTheDocument();
    expect(document.querySelector('#datatype button.cds--list-box__field')).toHaveTextContent('<Choose>');
  });

  it('uses a custom placeholder', () => {
    renderField({ placeholder: 'Pick one' });

    expect(document.querySelector('#datatype button.cds--list-box__field')).toHaveTextContent('Pick one');
  });

  it('shows the required asterisk only when the field is required', () => {
    const { unmount } = renderField({ isRequired: true, validate: [{ type: 'required' }] });
    expect(document.querySelector('label.cds--label').textContent).toMatch(/\*/);
    unmount();

    renderField();
    expect(document.querySelector('label.cds--label').textContent).not.toMatch(/\*/);
  });

  it('shows the icon named in data-icon for each option, and no icon when data-icon is missing', async() => {
    const user = userEvent.setup();
    renderField();

    await openList(user);
    const list = within(document.querySelector('#datatype'));
    const iconOf = (label) => list.getByText(label).parentElement.querySelector('svg');
    const expectedIcon = (name) => {
      const Icon = carbonizeIcon(name, { size: 16 });
      const wrapper = document.createElement('div');
      wrapper.innerHTML = renderToStaticMarkup(<Icon />);
      return wrapper.querySelector('svg').innerHTML;
    };

    expect(iconOf('String').innerHTML).toBe(expectedIcon('carbon--StringText'));
    expect(iconOf('Integer').innerHTML).toBe(expectedIcon('carbon--StringInteger'));
    expect(iconOf('String').innerHTML).not.toBe(iconOf('Integer').innerHTML);
    expect(iconOf('Plain')).toBeNull();
  });

  it('shows the selected option from the initial value', () => {
    renderField({}, { initialValues: { datatype: 'integer' } });

    expect(document.querySelector('#datatype button.cds--list-box__field')).toHaveTextContent('Integer');
  });

  it('submits the chosen option value', async() => {
    const user = userEvent.setup();
    const { onSubmit } = renderField();

    await openList(user);
    await user.click(within(document.querySelector('#datatype')).getByText('Integer'));
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(onSubmit.mock.calls[0][0]).toEqual({ datatype: 'integer' });
  });

  describe('includeEmpty', () => {
    it('offers an empty choice that clears the value', async() => {
      const user = userEvent.setup();
      const { onSubmit } = renderField({ includeEmpty: true }, { initialValues: { datatype: 'string' } });

      await openList(user);
      await user.click(within(document.querySelector('#datatype')).getByText('<Choose>', { selector: 'span' }));
      await user.click(screen.getByRole('button', { name: /^save$/i }));

      expect(onSubmit.mock.calls[0][0].datatype).toBeUndefined();
    });

    it('does not offer an empty choice by default', async() => {
      const user = userEvent.setup();
      renderField();

      await openList(user);

      expect(within(document.querySelector('#datatype')).queryAllByRole('option')).toHaveLength(OPTIONS.length);
    });
  });

  describe('clearFields', () => {
    const extraFields = [{
      component: 'text-field', name: 'default_value', id: 'default_value', label: 'Default Value',
    }];

    it('clears the listed fields when the selection changes', async() => {
      const user = userEvent.setup();
      const { onSubmit } = renderField(
        { clearFields: ['default_value'] },
        { initialValues: { datatype: 'string', default_value: 'abc' }, extraFields }
      );

      await openList(user);
      await user.click(within(document.querySelector('#datatype')).getByText('Integer'));
      await user.click(screen.getByRole('button', { name: /^save$/i }));

      expect(onSubmit.mock.calls[0][0].datatype).toBe('integer');
      expect(onSubmit.mock.calls[0][0].default_value || '').toBe('');
    });

    it('keeps the listed fields when the same option is chosen again', async() => {
      const user = userEvent.setup();
      renderField(
        { clearFields: ['default_value'] },
        { initialValues: { datatype: 'string', default_value: 'abc' }, extraFields }
      );

      await openList(user);
      await user.click(within(document.querySelector('#datatype')).getByRole('option', { name: 'String' }));

      expect(document.querySelector('input#default_value')).toHaveValue('abc');
    });
  });
});
