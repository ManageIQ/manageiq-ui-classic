import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordField from '../../components/async-credentials/password-field';

let mockChangeSpy;
let mockGetStateSpy;

jest.mock('@@ddf', () => ({
  useFormApi: () => ({
    renderForm: ([secret]) => <MockDummyComponent {...secret} />,
    change: mockChangeSpy,
    getState: mockGetStateSpy,
    getFieldState: (fieldName) => ({
      initial: `value-${fieldName}`,
    }),
  }),
  componentTypes: {
    TEXT_FIELD: 'text-field',
  },
}));

const MockDummyComponent = ({
  buttonLabel, isDisabled, setEditMode, ...props
}) => (
  <button {...props} onClick={setEditMode} disabled={isDisabled} type="button">
    {buttonLabel || 'Dummy'}
  </button>
);

describe('Secret switch field component', () => {
  let initialProps;

  beforeEach(() => {
    mockChangeSpy = jest.fn();
    mockGetStateSpy = jest.fn().mockReturnValue({
      values: {},
      initialValues: {
        foo: 'value-foo',
        bar: 'value-bar',
        nonAsync: 'non-async',
      },
    });
    initialProps = {
      edit: false,
      name: 'foo',
    };
  });

  afterEach(() => {
    mockChangeSpy.mockReset();
  });

  it('should render correctly in non edit mode', () => {
    const { container } = render(<PasswordField {...initialProps} />);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly in edit mode', () => {
    const { container } = render(<PasswordField {...initialProps} edit />);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly switch to editing', async() => {
    const user = userEvent.setup();
    render(<PasswordField {...initialProps} edit />);

    // Initially, MockDummyComponent (Cancel button) should not be present
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();

    // Click the edit button (the one with Edit icon)
    const editButton = screen.getByRole('button', { name: /change/i });
    await user.click(editButton);

    // After clicking, MockDummyComponent should be rendered with "Cancel" text
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('should render correctly reset secret field', async() => {
    const user = userEvent.setup();
    render(<PasswordField {...initialProps} edit />);

    // Click the edit button to enter edit mode
    const editButton = screen.getByRole('button', { name: /change/i });
    await user.click(editButton);

    // Wait for MockDummyComponent (Cancel button) to appear
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    // Click the cancel button (MockDummyComponent button)
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    // Verify that change was called with undefined to reset the field
    expect(mockChangeSpy).toHaveBeenCalledWith('foo', undefined);
  });
});
