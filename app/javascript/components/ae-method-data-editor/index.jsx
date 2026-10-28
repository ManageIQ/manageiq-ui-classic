import { useState, useEffect } from 'react';
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

  /** Allows miqSendOneTrans to send one request for this newly drawn editor. */
  useEffect(() => {
    ManageIQ.oneTransition.oneTrans = 0;
  }, []);

  /** Validates the method data on the server; the response renders the flash message. */
  const onValidate = () => miqAjaxButton(validateUrl, true);

  /** Updates the text and notifies the haml form that something changed. */
  const onBeforeChange = (_editor, _data, newValue) => {
    setText(newValue);
    if (url && window.miqSendOneTrans) {
      window.miqSendOneTrans(url);
    }
  };

  /** Used by the legacy javascript to refresh the editor when the tab becomes visible. */
  const editorDidMount = (editor) => {
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
