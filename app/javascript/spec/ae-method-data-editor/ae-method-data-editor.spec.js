import { render, act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AeMethodDataEditor from '../../components/ae-method-data-editor';

describe('AeMethodDataEditor component', () => {
  const props = {
    name: 'method_data',
    value: '$evm.log(:info, $evm.root)',
    url: '/miq_ae_class/form_method_field_changed/new?transOne=1',
  };

  const validateUrl = '/miq_ae_class/validate_method_data/new?button=validate';

  beforeEach(() => {
    window.ManageIQ = { ...window.ManageIQ, oneTransition: { oneTrans: 1 } };
    window.miqSendOneTrans = jest.fn();
    window.miqAjaxButton = jest.fn();
    window.focus = jest.fn();
  });

  it('should render correctly', () => {
    const { container } = render(<AeMethodDataEditor {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly with the validate button', () => {
    const { container } = render(<AeMethodDataEditor {...props} validateUrl={validateUrl} />);
    expect(container).toMatchSnapshot();
  });

  it('renders the hidden textarea with the provided value so the haml form can serialize it', () => {
    const { container } = render(<AeMethodDataEditor {...props} />);
    const textarea = container.querySelector('textarea#method_data');
    expect(textarea).toBeInTheDocument();
    expect(textarea.name).toBe('method_data');
    expect(textarea.value).toBe(props.value);
    expect(textarea).toHaveStyle('display: none');
  });

  it('resets the one transition flag when the editor is drawn', () => {
    render(<AeMethodDataEditor {...props} />);
    expect(ManageIQ.oneTransition.oneTrans).toBe(0);
  });

  it('does not notify the haml form on mount', () => {
    render(<AeMethodDataEditor {...props} />);
    expect(window.miqSendOneTrans).not.toHaveBeenCalled();
  });

  it('updates the hidden textarea and notifies the haml form when the content changes', () => {
    const { container } = render(<AeMethodDataEditor {...props} />);

    act(() => {
      container.querySelector('.CodeMirror').CodeMirror.setValue('foo');
    });

    expect(container.querySelector('textarea#method_data').value).toBe('foo');
    expect(window.miqSendOneTrans).toHaveBeenCalledWith(props.url);
  });

  it('does not render the validate button without a validateUrl', () => {
    render(<AeMethodDataEditor {...props} />);
    expect(screen.queryByRole('button', { name: 'Validate' })).not.toBeInTheDocument();
  });

  it('submits the serialized form to the validate url when Validate is clicked', async() => {
    const user = userEvent.setup();
    render(<AeMethodDataEditor {...props} validateUrl={validateUrl} />);

    await user.click(screen.getByRole('button', { name: 'Validate' }));

    expect(window.miqAjaxButton).toHaveBeenCalledWith(validateUrl, true);
  });

  it('disables the Validate button when the data is empty', () => {
    render(<AeMethodDataEditor {...props} value="" validateUrl={validateUrl} />);
    expect(screen.getByRole('button', { name: 'Validate' })).toBeDisabled();
  });

  it('enables the Validate button once data is entered', () => {
    const { container } = render(<AeMethodDataEditor {...props} value="" validateUrl={validateUrl} />);

    act(() => {
      container.querySelector('.CodeMirror').CodeMirror.setValue('foo');
    });

    expect(screen.getByRole('button', { name: 'Validate' })).toBeEnabled();
  });

  it('decorates syntax errors in the gutter when setSyntaxErrors is called', () => {
    render(<AeMethodDataEditor {...props} />);

    act(() => {
      ManageIQ.editor.setSyntaxErrors([
        { line: 1, message: 'syntax error, unexpected end-of-input' },
      ]);
    });

    const lineInfo = ManageIQ.editor.lineInfo(0);
    const marker = lineInfo.gutterMarkers['CodeMirror-error-markers'];
    expect(marker).toBeDefined();
    expect(marker.className).toBe('cm-gutter-error-marker');
    expect(marker.title).toBe('syntax error, unexpected end-of-input');
  });

  it('lists every message for a line that has several errors', () => {
    render(<AeMethodDataEditor {...props} />);

    act(() => {
      ManageIQ.editor.setSyntaxErrors([
        { line: 1, message: 'first error' },
        { line: 1, message: 'second error' },
      ]);
    });

    const marker = ManageIQ.editor.lineInfo(0).gutterMarkers['CodeMirror-error-markers'];
    expect(marker.title).toBe('first error\nsecond error');
  });

  it('groups an error reported past the end of the text with the errors on the last line', () => {
    render(<AeMethodDataEditor {...props} />);

    act(() => {
      ManageIQ.editor.setSyntaxErrors([
        { line: 1, message: 'on the last line' },
        { line: 5, message: 'unexpected end-of-input' },
      ]);
    });

    expect(ManageIQ.editor.lineCount()).toBe(1);
    const marker = ManageIQ.editor.lineInfo(0).gutterMarkers['CodeMirror-error-markers'];
    expect(marker.title).toBe('on the last line\nunexpected end-of-input');
  });

  it('places the cursor on the first reported error line', () => {
    render(<AeMethodDataEditor {...props} value={'a\nb\nc'} />);

    act(() => {
      ManageIQ.editor.setSyntaxErrors([
        { line: 3, message: 'reported first' },
        { line: 2, message: 'reported second' },
      ]);
    });

    expect(ManageIQ.editor.getCursor().line).toBe(2);
  });

  it('clears syntax error decorations when text is modified', () => {
    const { container } = render(<AeMethodDataEditor {...props} />);

    act(() => {
      ManageIQ.editor.setSyntaxErrors([
        { line: 1, message: 'syntax error, unexpected end-of-input' },
      ]);
    });

    expect(ManageIQ.editor.lineInfo(0).gutterMarkers?.['CodeMirror-error-markers']).toBeDefined();

    act(() => {
      container.querySelector('.CodeMirror').CodeMirror.setValue('fixed_code');
    });

    expect(ManageIQ.editor.lineInfo(0).gutterMarkers?.['CodeMirror-error-markers']).toBeUndefined();
  });

  it('clears syntax error decorations when clearSyntaxErrors is called', () => {
    render(<AeMethodDataEditor {...props} />);

    act(() => {
      ManageIQ.editor.setSyntaxErrors([
        { line: 1, message: 'syntax error, unexpected end-of-input' },
      ]);
    });

    expect(ManageIQ.editor.lineInfo(0).gutterMarkers?.['CodeMirror-error-markers']).toBeDefined();

    act(() => {
      ManageIQ.editor.clearSyntaxErrors();
    });

    expect(ManageIQ.editor.lineInfo(0).gutterMarkers?.['CodeMirror-error-markers']).toBeUndefined();
  });
});
