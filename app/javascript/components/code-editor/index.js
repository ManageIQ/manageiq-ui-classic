import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Controlled as CodeMirror } from 'react-codemirror2';

// editor modes
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/yaml/yaml';
// editor help
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';

const getMode = mode => ({
  json: { name: 'javascript', json: true },
})[mode] || mode;

const CodeEditor = ({
  onBeforeChange,
  mode,
  modes,
  ...props
}) => {
  const [codeMode, setCodeMode] = useState(mode);

  return (
    <div>
      {modes.length > 0 && (
        <ul>
          {modes.map(mode => <li key={mode}><button type="button" onClick={() => setCodeMode(mode)}>{mode}</button></li>)}
        </ul>
      )}
      <CodeMirror
        options={{
          mode: getMode(codeMode),
          theme: 'eclipse',
          lint: true,
          lineNumbers: true,
          lineWrapping: true,
          autoCloseBrackets: true,
          styleActiveLine: true,
          gutters: ['CodeMirror-lint-markers'],
        }}
        style={{ height: 'auto' }}
        onBeforeChange={onBeforeChange}
        {...props}
      />
    </div>
  );
};

CodeEditor.propTypes = {
  mode: PropTypes.oneOf(['json', 'yaml']),
  modes: PropTypes.arrayOf(PropTypes.string),
  onBeforeChange: PropTypes.func.isRequired,
};

CodeEditor.defaultProps = {
  mode: 'yaml',
  modes: [],
};

export const DataDrivenFormCodeEditor = ({
  FieldProvider,
  ...props
}) => (
  <FieldProvider {...props}>
    {({
      input: { value, onChange },
      meta: { error },
      formOptions: _formOptions,
      ...props
    }) => (
      <div>
        {error && <h2>{error}</h2>}
        <CodeEditor
          onBeforeChange={(_editor, _data, value) => onChange(value)}
          value={value}
          {...props}
        />
      </div>
    )}
  </FieldProvider>
);

export default CodeEditor;
