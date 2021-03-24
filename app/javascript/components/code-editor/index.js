import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { FormGroup, RadioButtonGroup, RadioButton } from 'carbon-components-react';
import { prepareProps } from '@data-driven-forms/carbon-component-mapper';

import { useFieldApi } from '@@ddf';
import HelperTextBlock from '../../forms/helper-text-block';
// editor modes
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/shell/shell';
// editor help
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';

const getMode = (mode) => ({
  json: { name: 'javascript', json: true },
})[mode] || mode;

const CodeEditor = (props) => {
  const {
    labelText,
    input: { value, onChange, name },
    FormGroupProps,
    helperText,
    meta: { error, warning, touched },
    validateOnMount,
    mode,
    modes,
    ...rest
  } = useFieldApi(prepareProps(props));

  const [codeMode, setCodeMode] = useState(mode);
  const [editor, setEditor] = useState();

  useEffect(() => {
    if (editor) {
      editor.refresh();
    }
  }, [editor]);

  const invalid = (touched || validateOnMount) && error;
  const warnText = (touched || validateOnMount) && warning;

  return (
    <FormGroup legendText={labelText} {...FormGroupProps}>
      {modes.length > 0 && (
        <RadioButtonGroup name={`--${name}--mode`} valueSelected={codeMode} onChange={(mode) => setCodeMode(mode)}>
          { modes.map((mode) => <RadioButton value={mode} labelText={mode} key={mode} />) }
        </RadioButtonGroup>
      )}
      <CodeMirror
        className={`miq-codemirror ${error ? 'has-error' : ''}`}
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
        onBeforeChange={(editor, _data, value) => {
          onChange(value);
        }}
        onChange={(editor, _data, value) => {
          onChange(value);
        }}
        editorDidMount={(editor) => {
          setEditor(editor);
        }}
        value={value}
        {...rest}
      />
      <HelperTextBlock helperText={helperText} errorText={invalid} warnText={warnText} />
    </FormGroup>
  );
};

CodeEditor.propTypes = {
  mode: PropTypes.oneOf(['json', 'yaml', 'xml', 'shell']),
  modes: PropTypes.arrayOf(PropTypes.string),
};

CodeEditor.defaultProps = {
  mode: 'yaml',
  modes: [],
};

export default CodeEditor;
