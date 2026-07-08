import React from 'react';
import { PropTypes } from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { http } from '../../../../http_api';
import miqRedirectBack from '../../../../helpers/miq-redirect-back';

const createSchema = (fields) => ({
  fields: [
    {
      component: 'sortable-list',
      id: 'field_order',
      name: 'field_order',
      label: __('Fields:'),
      helperText: __('Drag and drop to reorder fields. Select multiple consecutive fields using checkboxes to drag them together.'),
      labelKey: 'name',
      multiSelect: true,
    },
  ],
});

// Allows reordering of schema fields via drag-and-drop
const SchemaSequenceEditor = ({ classId }) => {
  const [initialFields, setInitialFields] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    http.get(`/miq_ae_class/fields_seq_data?id=${classId}`)
      .then((data) => {
        setInitialFields(data.fields || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [classId]);

  const onSubmit = (values) => {
    miqSparkleOn();
    const updatedFields = (values.field_order || []).map((field, idx) => ({
      id: field.id,
      priority: idx + 1,
    }));

    return http.post(
      `/miq_ae_class/fields_seq_save?id=${classId}`,
      { fields: updatedFields },
      { skipErrors: [422] }
    )
      .then((response) => {
        const message = response.message || __('Class Schema Sequence was saved');
        miqRedirectBack(message, 'success', '/miq_ae_class/explorer');
      })
      .catch((error) => {
        const message = error.data?.error || error.message || __('Error saving field order');
        miqSparkleOff();
        miqFlash('error', message);
      });
  };

  const onCancel = () => {
    miqRedirectBack(
      __('Edit of Class Schema Sequence was cancelled by the user'),
      'warning',
      '/miq_ae_class/explorer'
    );
  };

  if (!loaded) return null;

  return (
    <div className="schema-sequence-editor">
      <MiqFormRenderer
        schema={createSchema(initialFields)}
        initialValues={{ field_order: initialFields }}
        onSubmit={onSubmit}
        onCancel={onCancel}
        buttonsLabels={{
          submitLabel: __('Save'),
          cancelLabel: __('Cancel'),
          resetLabel: __('Reset'),
        }}
        canReset
      />
    </div>
  );
};

SchemaSequenceEditor.propTypes = {
  classId: PropTypes.string.isRequired,
};

export default SchemaSequenceEditor;
