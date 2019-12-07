import React from 'react';
import { componentTypes, layoutComponents, dataTypes } from '@data-driven-forms/react-form-renderer';
import { formFieldsMapper, layoutMapper } from '@data-driven-forms/pf3-component-mapper';
import { Switch, Modal, Icon, Button } from 'patternfly-react';

import Editor from 'ddf-editor';

import EditableTagControl from './EditableTagControl';
import EditableTabs from './EditableTabs';
import EditableSection from './EditableSection';
import EditableFormWrapper from './EditableFormWrapper';
import FieldArray from './FieldArray';
import previewFieldsMapper from './previewFieldsMapper';
import editSchema from './editSchema';

const draggableDecorators = {
  [componentTypes.SUB_FORM]: EditableSection,
  [componentTypes.TABS]: EditableTabs,
  [layoutComponents.FORM_WRAPPER]: EditableFormWrapper,
  'tag-control': ident => ident,
};

const customReducer = (state, { type, ...action }, helpers) => {
  switch (type) {
    case 'newSection': {
      const [id, fieldCounter] = helpers.genIdentifier(componentTypes.SUB_FORM, state.fieldCounter, state.schema);

      const item = {
        component: componentTypes.SUB_FORM,
        name: `${componentTypes.SUB_FORM}-${id}`,
        title: `Section ${id}`,
        visible: true,
        fields: [],
      };

      const schema = helpers.traverse(state.schema, action.target, (fields, idx) => helpers.insert.child(fields, item, idx));

      return { ...state, schema, fieldCounter };
    }
    case 'newTab': {
      // Foe a better experience, a new tab always contains an new empty section
      const [tId, fc] = helpers.genIdentifier(componentTypes.TAB_ITEM, state.fieldCounter, state.schema);
      const [sId, fieldCounter] = helpers.genIdentifier(componentTypes.SUB_FORM, fc, state.schema);

      const item = {
        component: componentTypes.TAB_ITEM,
        name: `${componentTypes.TAB_ITEM}-${tId}`,
        title: `Tab ${tId}`,
        visible: true,
        fields: [
          {
            component: componentTypes.SUB_FORM,
            name: `${componentTypes.SUB_FORM}-${sId}`,
            title: `Section ${sId}`,
            fields: [],
          },
        ],
      };

      const schema = helpers.traverse(state.schema, action.target, (fields, idx) => helpers.insert.child(fields, item, idx));

      return { ...state, schema, fieldCounter };
    }
    default:
      return undefined;
  }
};

const toolboxFields = {
  [componentTypes.TEXT_FIELD]: {
    title: 'Text Box',
    icon: <Icon type="fa" name="font" />,
    defaultSchema: {
      type: 'text',
      dataType: dataTypes.STRING,
    },
  },
  [componentTypes.TEXTAREA_FIELD]: {
    title: 'Text Area',
    icon: <Icon type="fa" name="file-text-o" />,
    defaultSchema: {
      dataType: dataTypes.STRING,
    },
  },
  [componentTypes.CHECKBOX]: {
    title: 'Checkbox',
    icon: <Icon type="fa" name="check-square-o" />,
  },
  [componentTypes.SELECT]: {
    title: 'Dropdown',
    icon: <Icon type="fa" name="caret-square-o-down" />,
    defaultSchema: {
      dataType: dataTypes.STRING,
      isClearable: true,
      options: [
        { label: 'One', value: '1' },
        { label: 'Two', value: '2' },
        { label: 'Three', value: '3' },
      ],
    },
  },
  [componentTypes.RADIO]: {
    title: 'Radio Button',
    icon: <Icon type="fa" name="circle-o" />,
    defaultSchema: {
      dataType: dataTypes.STRING,
      options: [
        { label: 'One', value: '1' },
        { label: 'Two', value: '2' },
        { label: 'Three', value: '3' },
      ],
    },
  },
  [componentTypes.DATE_PICKER]: {
    title: 'Datepicker',
    icon: <Icon type="fa" name="calendar" />,
    defaultSchema: {
      disabledDays: [{
        before: 'today',
      }],
      variant: 'date',
    },
  },
  'tag-control': {
    title: 'Tag Control',
    icon: <Icon type="fa" name="tags" />,
  },
};

const PreviewSwitch = ({ value, onChange }) => <Switch onText="View" offText="Edit" value={value} inverse onChange={onChange} />;

const EditIcon = <Icon type="fa" name="pencil" fixedWidth />;
const DeleteIcon = <Icon type="fa" name="times" fixedWidth />;

const PropertiesModal = ({ title, show, onHide, container, children }) => (
  <Modal container={container} show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>{ title }</Modal.Title>
    </Modal.Header>
    <Modal.Body>{ children }</Modal.Body>
  </Modal>
);

const FormControls = (disabled, schema) => {
  const cancel = () => {
    if (confirm(__('Abandon changes?'))) {
      window.miqFlashLater({
        level: 'warning',
        message: __('Dialog editing was canceled by the user.'),
      });
      window.location.href = '/miq_ae_customization/explorer';
    }
  };

  const submit = () => {
    console.log(schema);
    alert("This doesn't do anything yet!");
  };

  return (<>
    <Button disabled={!!disabled} bsStyle="primary" onClick={submit}>Submit</Button>
    <Button disabled={!!disabled} style={{ marginLeft: 3 }} onClick={cancel}>Cancel</Button>
  </>);
};

const editorFieldsMapper = {
  ...formFieldsMapper,
  [componentTypes.FIELD_ARRAY]: FieldArray,
};

const DialogEditor = ({ schema }) => (
  <Editor
    draggableDecorators={draggableDecorators}
    draggableFieldsMapper={{ ...formFieldsMapper, 'tag-control': EditableTagControl }}
    draggableLayoutMapper={layoutMapper}
    previewFieldsMapper={previewFieldsMapper}
    previewLayoutMapper={layoutMapper}
    editorFieldsMapper={editorFieldsMapper}
    editorLayoutMapper={layoutMapper}
    EditIcon={EditIcon}
    DeleteIcon={DeleteIcon}
    customReducer={customReducer}
    editSchema={editSchema}
    toolboxFields={toolboxFields}
    initialSchema={schema}
    FormControls={FormControls}
    PreviewSwitch={PreviewSwitch}
    PropertiesModal={PropertiesModal}
  />
);

export default DialogEditor;
