import {
  useState, useRef, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { FormGroup, RadioButtonGroup, RadioButton } from '@carbon/react';
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
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/search/matchesonscrollbar.css';
import 'codemirror/addon/search/match-highlighter';
import 'codemirror/addon/scroll/annotatescrollbar';
import 'codemirror/addon/display/panel';

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
    mode = 'yaml',
    modes = [],
    showSearch = false,
    ...rest
  } = useFieldApi(prepareProps(props));

  const [codeMode, setCodeMode] = useState(mode);
  const editorRef = useRef(null);
  const cursorRef = useRef(null);
  const scrollbarRef = useRef(null);

  const runSearch = useCallback((query, forward = true) => {
    const cm = editorRef.current;
    if (!cm || !query) {
      return;
    }

    // update scrollbar highlights
    if (scrollbarRef.current) {
      scrollbarRef.current.clear();
    }
    scrollbarRef.current = cm.showMatchesOnScrollbar(query, true);

    // always create a fresh cursor from the current selection so direction changes work correctly
    let startPos;
    if (forward) {
      startPos = cursorRef.current ? cursorRef.current.to() : cm.getCursor();
    } else {
      startPos = cursorRef.current ? cursorRef.current.from() : cm.getCursor();
    }
    cursorRef.current = cm.getSearchCursor(query, startPos, true);
    cursorRef.current.query = query;

    const found = forward ? cursorRef.current.findNext() : cursorRef.current.findPrevious();
    if (!found) {
      // wrap around to opposite end of document
      const lastLine = cm.lastLine();
      const wrapPos = forward
        ? { line: 0, ch: 0 }
        : { line: lastLine, ch: cm.getLine(lastLine).length };
      cursorRef.current = cm.getSearchCursor(query, wrapPos, true);
      cursorRef.current.query = query;
      if (forward) {
        cursorRef.current.findNext();
      } else {
        cursorRef.current.findPrevious();
      }
    }

    if (cursorRef.current.from()) {
      cm.setSelection(cursorRef.current.from(), cursorRef.current.to());
      cm.scrollIntoView({ from: cursorRef.current.from(), to: cursorRef.current.to() }, 40);
    }
  }, []);

  const clearSearch = useCallback(() => {
    if (scrollbarRef.current) {
      scrollbarRef.current.clear();
      scrollbarRef.current = null;
    }
    cursorRef.current = null;
  }, []);

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
          highlightSelectionMatches: { annotateScrollbar: true },
        }}
        style={{ height: 'auto' }}
        onBeforeChange={(_editor, _data, value) => {
          onChange(value);
        }}
        onChange={(_editor, _data, value) => {
          onChange(value);
        }}
        editorDidMount={(mountedEditor) => {
          editorRef.current = mountedEditor;
          mountedEditor.refresh();

          if (showSearch) {
            const panel = document.createElement('div');
            panel.className = 'miq-codemirror-search-panel';
            panel.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 6px;border-bottom:1px solid #ddd;background:#f5f5f5;';

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Search…';
            input.style.cssText = 'flex:1;min-width:0;padding:2px 6px;border:1px solid #ccc;border-radius:3px;font-size:13px;';

            const btnPrev = document.createElement('button');
            btnPrev.type = 'button';
            btnPrev.textContent = '▲';
            btnPrev.title = 'Previous match';
            btnPrev.style.cssText = 'padding:1px 6px;font-size:11px;cursor:pointer;';

            const btnNext = document.createElement('button');
            btnNext.type = 'button';
            btnNext.textContent = '▼';
            btnNext.title = 'Next match';
            btnNext.style.cssText = 'padding:1px 6px;font-size:11px;cursor:pointer;';

            panel.appendChild(input);
            panel.appendChild(btnPrev);
            panel.appendChild(btnNext);

            let lastQuery = '';

            input.addEventListener('input', () => {
              const q = input.value;
              if (q !== lastQuery) {
                lastQuery = q;
                if (scrollbarRef.current) {
                  scrollbarRef.current.clear();
                  scrollbarRef.current = null;
                }
                cursorRef.current = null;
              }
              if (q) {
                runSearch(q, true);
              } else {
                clearSearch();
              }
            });

            input.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                runSearch(input.value, !e.shiftKey);
              }
            });

            btnNext.addEventListener('click', () => runSearch(input.value, true));
            btnPrev.addEventListener('click', () => runSearch(input.value, false));

            mountedEditor.addPanel(panel, { position: 'top', stable: true });
          }
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

export default CodeEditor;
