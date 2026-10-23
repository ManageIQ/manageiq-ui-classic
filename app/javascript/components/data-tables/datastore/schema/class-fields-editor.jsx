import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { InlineNotification, Modal } from '@carbon/react';
import MiqFormRenderer from '@@ddf';
import { schemaHeaders, createEditableRows } from '../helper';
import createClassFieldsSchema from './modal-form.schema';
import createSchemaEditSchema from './class-fields-schema';
import mapper from '../../../../forms/mappers/componentMapper';
import { SchemaTableComponent } from './schema-table';
import miqRedirectBack from '../../../../helpers/miq-redirect-back';
import { http } from '../../../../http_api';

// The server renders stored passwords as this mask; it must never be sent back as a value.
const PASSWORD_MASK = '********';

export const ClassFieldsEditor = ({
  aeClassId, initialData, aeTypeOptions = [], dTypeOptions = [],
}) => {
  const componentMapper = {
    ...mapper,
    'schema-table': SchemaTableComponent,
  };

  const fieldData = createEditableRows(initialData);

  const transformedRows = () => {
    const rowItems = [];
    const headers = schemaHeaders(true);
    fieldData.forEach(({
      id, field_id: fieldId, cells, clickable, aetype, datatype, display_name: displayName, substitute,
    }) => {
      const reducedItems = cells.reduce((result, item, index) => {
        result[headers[index].name] = item;
        result.id = fieldId ? fieldId.toString() : id.toString();
        result.field_id = fieldId;
        result.clickable = clickable;
        return result;
      }, {});
      reducedItems.aetype = { text: aetype };
      reducedItems.datatype = { text: datatype };
      reducedItems.display_name = { text: displayName };
      reducedItems.substitute = { text: substitute };
      rowItems.push(reducedItems);
    });

    return rowItems;
  };

  const [notification, setNotification] = useState(null);
  const [modalNotification, setModalNotification] = useState(null);

  const [state, setState] = useState({
    isModalOpen: false,
    selectedRowId: undefined,
    rows: transformedRows(),
    formKey: true,
    isSchemaModified: false,
  });

  // The saved rows. Save and Reset stay disabled until the table differs from these.
  const [baselineRows, setBaselineRows] = useState(state.rows);

  const handleModalClose = () => {
    setModalNotification(null);
    setState((s) => ({ ...s, isModalOpen: false, selectedRowId: undefined }));
  };

  /**
   * Builds a table row from field values.
   * The table only shows a masked password, so a password typed in the modal is saved in
   * `password_value`. If the user left the mask as is, the earlier `previousPassword` is kept.
   * Rows loaded from the server have no `password_value`, so their stored password stays unchanged.
   */
  const formatFieldValues = (field, rowId, { userEntered = false, previousPassword } = {}) => {
    if (!field || typeof field !== 'object') {
      return [];
    }

    let passwordValue;
    if (userEntered && field.datatype === 'password') {
      passwordValue = field.default_value === PASSWORD_MASK ? previousPassword : (field.default_value || '');
    }

    const getFieldName = () => ((field.display_name) ? `${field.display_name} (${field.name})` : `${field.name}`);

    const getIconForValue = () => {
      const aeMatch = aeTypeOptions.find((option) => option[1] === field.aetype);
      const aeTypeIcon = (aeMatch && aeMatch[2] && aeMatch[2]['data-icon']) || '';

      const dtypeMatch = dTypeOptions.find((option) => option[1] === field.datatype);
      const dTypeIcon = (dtypeMatch && dtypeMatch[2] && dtypeMatch[2]['data-icon']) || '';

      const subIcon = (field.substitute) ? 'pficon pficon-ok' : 'pficon pficon-close';

      return [aeTypeIcon, dTypeIcon, subIcon];
    };

    const getDefaultValue = () => {
      if (field.datatype === 'password' && field.default_value) {
        return PASSWORD_MASK;
      }
      return field.default_value || '';
    };

    return {
      id: rowId.toString(),
      field_id: field.id || null,
      name: { text: getFieldName(), icon: getIconForValue() || [] },
      aetype: { text: field.aetype },
      datatype: { text: field.datatype },
      default_value: { text: getDefaultValue() },
      password_value: passwordValue,
      display_name: { text: field.display_name || '' },
      description: { text: field.description || '' },
      substitute: { text: field.substitute },
      collect: { text: field.collect || '' },
      message: { text: field.message || '' },
      on_entry: { text: field.on_entry || '' },
      on_exit: { text: field.on_exit || '' },
      on_error: { text: field.on_error || '' },
      max_retries: { text: field.max_retries || '' },
      max_time: { text: field.max_time || '' },
      edit: {
        is_button: true, text: __('Update'), kind: 'tertiary', size: 'md', callback: 'editClassField',
      },
      delete: {
        is_button: true, text: __('Delete'), kind: 'danger', size: 'md', callback: 'deleteClassField',
      },
    };
  };

  // NOTE: do NOT use `|| null` here — that would coerce `false` to `null` and
  // break the substitute boolean (substitute=false would arrive at the server as null).
  const cellText = (cell) => {
    if (cell === null || cell === undefined) {
      return null;
    }
    if (typeof cell === 'object') {
      return cell.text !== undefined ? cell.text : null;
    }
    return cell;
  };

  const extractFieldName = (cell) => {
    const text = cellText(cell);
    if (!text) {
      return null;
    }
    const match = text.match(/\(([^)]+)\)$/);
    return match ? match[1] : text;
  };

  // For passwords, send only what the user typed. If nothing was typed, the server keeps the old password.
  const payloadDefaultValue = (row) => (
    cellText(row.datatype) === 'password' ? row.password_value : cellText(row.default_value)
  );

  const buildSavePayload = (rows, deletedIds) => ({
    fields: rows.map((row, i) => ({
      id: row.field_id || null,
      name: extractFieldName(row.name),
      aetype: cellText(row.aetype),
      datatype: cellText(row.datatype),
      default_value: payloadDefaultValue(row),
      display_name: cellText(row.display_name),
      description: cellText(row.description),
      substitute: cellText(row.substitute),
      collect: cellText(row.collect),
      message: cellText(row.message),
      on_entry: cellText(row.on_entry),
      on_exit: cellText(row.on_exit),
      on_error: cellText(row.on_error),
      max_retries: cellText(row.max_retries),
      max_time: cellText(row.max_time),
      priority: i + 1,
    })),
    fields_to_delete: deletedIds,
  });

  const [deletedFieldIds, setDeletedFieldIds] = useState([]);

  // Row ids must stay unique: rows from the server are keyed by their DB id, so new rows get a
  // prefixed, ever-increasing id instead of one derived from the row count.
  const newRowCounter = useRef(0);
  const nextNewRowId = () => {
    newRowCounter.current += 1;
    return `new-${newRowCounter.current}`;
  };

  const onModalSubmit = (values) => {
    const isEdit = state.selectedRowId !== undefined;
    const existingRow = isEdit ? state.rows[state.selectedRowId] : null;
    const rowId = isEdit ? existingRow.id : nextNewRowId();
    const fieldId = existingRow ? existingRow.field_id : null;

    // A blank password on an existing password row keeps the stored one (shown as the mask).
    const keepsPassword = isEdit
      && values.datatype === 'password'
      && !values.default_value
      && existingRow.datatype.text === 'password';
    const submitted = keepsPassword ? { ...values, default_value: existingRow.default_value.text } : values;

    const formatted = formatFieldValues({ ...submitted, id: fieldId }, rowId, {
      userEntered: true,
      previousPassword: existingRow ? existingRow.password_value : undefined,
    });

    setState((prev) => ({
      ...prev,
      isSchemaModified: !prev.isSchemaModified,
      rows: isEdit
        ? prev.rows.map((r, i) => (i === state.selectedRowId ? formatted : r))
        : [...prev.rows, formatted],
    }));
    handleModalClose();
  };

  const onFieldDelete = (rowId) => {
    const row = state.rows.find((r) => r.id === rowId);
    if (row && row.field_id) {
      setDeletedFieldIds((ids) => [...ids, row.field_id]);
    }
    setState((prev) => ({
      ...prev,
      isSchemaModified: !prev.isSchemaModified,
      rows: prev.rows.filter((r) => r.id !== rowId),
    }));
  };

  const onRequestError = (error) => {
    setNotification({
      kind: 'error',
      message: (error.data && error.data.error) || error.message || __('Error saving schema'),
    });
  };

  const updateFieldsUrl = (button) => `/miq_ae_class/update_fields/${aeClassId}?button=${button}`;

  const onSchemaSave = () => {
    setNotification(null);
    const payload = buildSavePayload(state.rows, deletedFieldIds);
    http.post(updateFieldsUrl('save'), payload, { skipErrors: [422] })
      .then((response) => miqRedirectBack(response.message, 'success', '/miq_ae_class/explorer'))
      .catch(onRequestError);
  };

  const onSchemaReset = () => {
    setNotification(null);
    http.post(updateFieldsUrl('reset'), {}, { skipErrors: [422] })
      .then((response) => {
        const savedRows = (response.fields || []).map((f, i) => formatFieldValues(f, i));
        setDeletedFieldIds([]);
        setBaselineRows(savedRows);
        setState((prev) => ({
          ...prev,
          isSchemaModified: !prev.isSchemaModified,
          rows: savedRows,
        }));
        add_flash(response.message, 'warning');
      })
      .catch(onRequestError);
  };

  const onCancel = () => {
    setNotification(null);
    http.post(updateFieldsUrl('cancel'), {}, { skipErrors: [422] })
      .then((response) => miqRedirectBack(response.message, 'success', '/miq_ae_class/explorer'))
      .catch(onRequestError);
  };

  return (
    <>
      {notification && (
        <InlineNotification
          kind={notification.kind}
          title={notification.message}
          lowContrast
          onCloseButtonClick={() => setNotification(null)}
        />
      )}
      <MiqFormRenderer
        schema={createSchemaEditSchema(state.rows, setState, state.isSchemaModified, onFieldDelete)}
        initialValues={{ 'schema-table': baselineRows }}
        componentMapper={componentMapper}
        onSubmit={onSchemaSave}
        onCancel={onCancel}
        canReset
        onReset={onSchemaReset}
        buttonsLabels={{ submitLabel: __('Save') }}
      />

      <Modal
        open={state.isModalOpen}
        modalHeading={state.selectedRowId === undefined ? __('Add New Field') : __('Edit Field')}
        onRequestClose={handleModalClose}
        size="md"
        passiveModal
      >
        {modalNotification && (
          <InlineNotification
            kind={modalNotification.kind}
            title={modalNotification.message}
            lowContrast
            onCloseButtonClick={() => setModalNotification(null)}
          />
        )}
        <MiqFormRenderer
          key={state.formKey}
          schema={createClassFieldsSchema(
            state.selectedRowId,
            aeTypeOptions,
            dTypeOptions,
            state.rows[state.selectedRowId],
          )}
          onSubmit={onModalSubmit}
          onCancel={handleModalClose}
          canReset
          onReset={() => setModalNotification({ kind: 'warning', message: __('All changes have been reset') })}
          disableSubmit={['invalid']}
          buttonsLabels={{ submitLabel: __('Save') }}
        />
      </Modal>
    </>
  );
};

// Option rows built by the controller: [label, value, { 'data-icon': 'css classes' }]
const optionsPropType = PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})])));

ClassFieldsEditor.propTypes = {
  aeClassId: PropTypes.number.isRequired,
  initialData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  aeTypeOptions: optionsPropType,
  dTypeOptions: optionsPropType,
};
