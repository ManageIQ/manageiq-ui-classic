import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@carbon/react';
import { Controlled as CodeMirror } from 'react-codemirror2';
// editor modes
import 'codemirror/mode/ruby/ruby';
// editor help
import 'codemirror/addon/edit/matchbrackets';

/**
 * Code editor for the data of an inline automate method, including the Validate button.
 * A hidden textarea (same id/name as the previous haml textarea) is kept in sync with the editor,
 * so that the haml form (Validate / Save / Add buttons) can keep serializing the value.
 */
const AeMethodDataEditor = ({
  name, value = '', url = undefined, validateUrl = undefined, mode = 'ruby',
}) => {
  const [text, setText] = useState(value || '');
  const editorRef = useRef(null);
  const textMarkersRef = useRef([]);

  /** Allows miqSendOneTrans to send one request for this newly drawn editor. */
  useEffect(() => {
    ManageIQ.oneTransition.oneTrans = 0;
  }, []);

  /** Clears gutter error markers and wavy text underlines from the editor. */
  const clearErrors = (cm) => {
    const editor = cm || editorRef.current;
    if (editor) {
      editor.clearGutter('CodeMirror-error-markers');
    }
    textMarkersRef.current.forEach((marker) => marker.clear());
    textMarkersRef.current = [];
  };

  /** Sets error markers and underlines for the provided syntax errors array: [{ line, message }, ...] */
  const setSyntaxErrors = (errors = []) => {
    const cm = editorRef.current;
    if (!cm) {
      return;
    }

    clearErrors(cm);

    if (!errors || errors.length === 0) {
      return;
    }

    // The checker can report several errors for one line, or a line past the end of the text
    // (e.g. "unexpected end-of-input"), so group the messages by the line they land on.
    const lastLine = cm.lineCount() - 1;
    const messagesByLine = new Map();
    errors.forEach((err) => {
      const lineIdx = Math.min(Math.max(0, err.line - 1), lastLine);
      messagesByLine.set(lineIdx, [...(messagesByLine.get(lineIdx) || []), err.message]);
    });

    messagesByLine.forEach((messages, lineIdx) => {
      const title = messages.join('\n');

      // Gutter error indicator
      const marker = document.createElement('div');
      marker.className = 'cm-gutter-error-marker';
      marker.title = title;
      marker.textContent = '●';
      cm.setGutterMarker(lineIdx, 'CodeMirror-error-markers', marker);

      // Wavy underline on the error line
      const lineLength = cm.getLine(lineIdx)?.length || 1;
      const textMarker = cm.markText(
        { line: lineIdx, ch: 0 },
        { line: lineIdx, ch: lineLength },
        {
          className: 'cm-syntax-error-text',
          title,
        },
      );
      textMarkersRef.current.push(textMarker);
    });

    // Place cursor on the first error line without scrolling away from flash message
    const [firstLine] = messagesByLine.keys();
    cm.setCursor({ line: firstLine, ch: 0 }, null, { scroll: false });
  };

  /** Validates the method data on the server; the response renders the flash message. */
  const onValidate = () => miqAjaxButton(validateUrl, true);

  /** Updates the text, clears syntax error highlights, and notifies the haml form that something changed. */
  const onBeforeChange = (editor, _data, newValue) => {
    clearErrors(editor);
    setText(newValue);
    if (url && window.miqSendOneTrans) {
      window.miqSendOneTrans(url);
    }
  };

  /**
   * Stores the CodeMirror instance, exposes the syntax error helpers on it, and publishes it as
   * ManageIQ.editor so the validate response and the legacy tab refresh code can reach it.
   */
  const editorDidMount = (editor) => {
    editorRef.current = editor;
    editor.setSyntaxErrors = setSyntaxErrors;
    editor.clearSyntaxErrors = () => clearErrors(editor);
    ManageIQ.editor = editor;
    editor.focus();
  };

  return (
    <div className="ae-method-data-editor">
      <textarea id={name} name={name} value={text} style={{ display: 'none' }} readOnly />
      <CodeMirror
        className="miq-codemirror"
        options={{
          mode,
          theme: 'eclipse',
          lineNumbers: true,
          matchBrackets: true,
          gutters: ['CodeMirror-linenumbers', 'CodeMirror-error-markers'],
          inputStyle: 'contenteditable',
          viewportMargin: Infinity,
        }}
        style={{ height: 'auto' }}
        value={text}
        onBeforeChange={onBeforeChange}
        editorDidMount={editorDidMount}
      />
      {validateUrl && (
        <div className="ae-method-data-validate" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <Button
            id="ae-method-data-validate"
            kind="primary"
            size="sm"
            disabled={text.trim() === ''}
            title={text.trim() === '' ? __('Enter data to Validate') : __('Validate method data')}
            onClick={onValidate}
          >
            {__('Validate')}
          </Button>
        </div>
      )}
    </div>
  );
};

AeMethodDataEditor.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  url: PropTypes.string,
  validateUrl: PropTypes.string,
  mode: PropTypes.string,
};

export default AeMethodDataEditor;
