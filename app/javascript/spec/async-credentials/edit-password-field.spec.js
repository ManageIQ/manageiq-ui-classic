import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditPasswordField from '../../components/async-credentials/edit-password-field';

jest.mock('@@ddf', () => ({
  useFieldApi: (props) => ({ meta: {}, input: {}, ...props }),
  componentTypes: {
    TEXT_FIELD: 'text-field',
  },
}));

describe('Edit secret field form component', () => {
  let initialProps;
  beforeEach(() => {
    initialProps = {
      label: 'foo',
      setEditMode: jest.fn(),
    };
  });

  it('should render correctly', () => {
    const { container } = render(<EditPasswordField {...initialProps} />);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly in error state', () => {
    initialProps.meta = { error: 'error message', touched: true };
    const { container } = render(<EditPasswordField {...initialProps} />);

    // Check that the input has invalid state
    const input = container.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('data-invalid', 'true');

    // Check that error message is displayed
    expect(screen.getByText('error message')).toBeInTheDocument();
  });

  it('should call setEditMode on input button click', async() => {
    const setEditMode = jest.fn();
    const user = userEvent.setup();
    render(<EditPasswordField {...initialProps} setEditMode={setEditMode} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(setEditMode).toHaveBeenCalled();
  });
});
