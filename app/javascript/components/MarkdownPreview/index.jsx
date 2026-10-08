import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Controlled as CodeMirror } from 'react-codemirror2';
import MiqMarkdown from '../MiqMarkdown';
import { previewConfiguration } from './helper';

/** Component to preview the markdown contents on-the-fly. */
const MarkdownPreview = ({
  content, url, type,
}) => {
  const miqCustomTabReducer = useSelector((state) => state.miqCustomTabReducer);
  const { title, mode, field } = previewConfiguration[type];

  const [editorContent, setEditorContent] = useState(content);
  const isMounted = useRef(false);

  /** Sync the hidden textarea and persist to server on every change. */
  useEffect(() => {
    const textArea = document.getElementById(field);
    textArea.value = editorContent;
    if (isMounted.current) {
      window.miqObserveRequest(url, { data: { [field]: editorContent } });
    } else {
      isMounted.current = true;
    }
  }, [editorContent]);

  /** The code-mirror component needs to be refreshed when the tab selection is changed.
   * If this is not used, then the code mirror will not load its default value.
  */
  useEffect(() => {
    window.miq_refresh_code_mirror();
  }, [miqCustomTabReducer]);

  /** Function to render the title of editor and preview sections. */
  const renderTitle = (type) => (
    <div className="markdown-section-title">
      {`${title} - ${type}`}
    </div>
  );

  /** Function to render the code-mirror editor. */
  const renderEditor = () => (
    <div className="markdown-section" id="editor">
      {renderTitle(__('Editor'))}
      <div className="markdown-section-content">
        <CodeMirror
          className="miq-codemirror miq-structured-list-code-mirror"
          options={{
            mode,
            lineNumbers: true,
            matchBrackets: true,
            theme: 'eclipse',
            viewportMargin: Infinity,
            readOnly: false,
          }}
          onBeforeChange={(_editor, _data, value) => setEditorContent(value)}
          value={editorContent}
        />
      </div>
    </div>
  );

  /** Function to render the preview of the data entered in code-mirror editor. */
  const renderPreview = () => (
    <div className="markdown-section" id="preview">
      {renderTitle(__('Preview'))}
      <div className="markdown-section-content">
        <MiqMarkdown content={editorContent} />
      </div>
    </div>
  );

  return (
    <div className="markdown-wrapper">
      {renderEditor()}
      {renderPreview()}
    </div>
  );
};

MarkdownPreview.propTypes = {
  content: PropTypes.string,
  url: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default MarkdownPreview;
