import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CodeEditor from '../../components/code-editor';

jest.mock('@@ddf', () => ({
  useFieldApi: (props) => ({
    meta: {},
    input: {
      value: '',
      onChange: props.onChange || jest.fn(),
      name: 'code-editor',
    },
    ...props,
  }),
}));

describe('CodeEditor component', () => {
  let initialProps;
  beforeEach(() => {
    initialProps = {
      onChange: jest.fn(),
      labelText: 'foo',
    };
  });

  it('should render correctly', () => {
    const { container } = render(<CodeEditor {...initialProps} />);
    expect(container).toMatchSnapshot();
  });

  it('should render mode switches', () => {
    const { container } = render(<CodeEditor {...initialProps} modes={['yaml', 'json']} />);

    // Verify radio buttons for mode switching are present
    expect(screen.getByRole('radio', { name: /yaml/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /json/i })).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it('should mount and assign correct props to data driven variant', async() => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<CodeEditor {...initialProps} onChange={onChange} />);

    // Find the CodeMirror textarea
    const textarea = screen.getByRole('textbox');

    // Type into the editor
    await user.type(textarea, 'foo');

    // Verify onChange was called
    expect(onChange).toHaveBeenCalled();
  });
});
