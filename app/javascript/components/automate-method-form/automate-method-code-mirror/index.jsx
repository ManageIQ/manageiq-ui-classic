import React, { useState, useEffect, useContext } from 'react';
import { Button, Accordion, AccordionItem } from 'carbon-components-react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { http } from '../../../http_api';
import NotificationMessage from '../../notification-message';
import AutomateMethodContext from '../automate-method-context';

const AutomateMethodCodeMirror = () => {
  const { updateCodeEditor } = useContext(AutomateMethodContext);

  const defaultEditorContents = `#\n# Description: <Method description here>\n#\n`;

  const [data, setData] = useState({
    editorContents: defaultEditorContents,
    enableValidationButton: false,
    validation: undefined,
  });

  useEffect(() => {
    updateCodeEditor(data.editorContents);
  }, [data.validation]);

  const validate = () => {
    const formData = { cls_method_data: data.editorContents };
    http.post('/miq_ae_class/validate_automate_method_data/new?button=validate', formData).then((response) => {
      setData({
        ...data,
        validation: response,
      });
    });
  };

  const renderValidateButton = () => (
    <div className="custom-form-buttons">
      <Button kind="primary" size="sm" onClick={validate}>Validate</Button>
    </div>
  );

  return (
    <div className="automate-code-mirror custom-form-wrapper">
      <Accordion align="start" className="miq-custom-form-accordion">
        <AccordionItem title={__('Data')} open>
          {
            data.validation && <NotificationMessage type={data.validation.status ? 'success' : 'error'} message={data.validation.message} />
          }
          <CodeMirror
            className="miq-codemirror miq-structured-list-code-mirror"
            options={{
              mode: 'ruby',
              lineNumbers: true,
              matchBrackets: true,
              theme: 'eclipse',
              viewportMargin: Infinity,
              readOnly: false,
            }}
            onBeforeChange={(_editor, _data, value) => setData({ ...data, validation: undefined, editorContents: value })}
            value={data.editorContents}
          />
          {renderValidateButton()}
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AutomateMethodCodeMirror;
