import React, {
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Modal } from '@carbon/react';
import MiqFormRenderer from '@@ddf';
import { schemaHeaders, createEditableRows } from '../helper';
import createClassFieldsSchema from './modal-form.schema';
import createSchemaEditSchema from './class-fields-schema';
import mapper from '../../../../forms/mappers/componentMapper';
import { SchemaTableComponent } from './schema-table';
import miqRedirectBack from '../../../../helpers/miq-redirect-back';
import miqFlash from '../../../../helpers/miq-flash';

export const ClassFieldsEditor = (props) => {
  const {
    aeClassId, initialData, aeTypeOptions, dTypeOptions,
  } = props;

  const componentMapper = {
    ...mapper,
    'schema-table': SchemaTableComponent,
  };

  const fieldData = createEditableRows(initialData);

  const transformedRows = () => {
    const rowItems = [];
    const headers = schemaHeaders(true);
    fieldData.forEach(({
      // eslint-disable-next-line camelcase
      id, field_id, cells, clickable, aetype, datatype, display_name, substitute,
    }) => {
      // eslint-disable-next-line camelcase
      const fieldId = field_id;
      const reducedItems = cells.reduce((result, item, index) => {
        result[headers[index].name] = item;
        result.id = fieldId ? fieldId.toString() : id.toString();
        result.field_id = fieldId;
        result.clickable = clickable;
        return result;
      }, {});
      reducedItems.aetype = { text: aetype };
      reducedItems.datatype = { text: datatype };
      reducedItems.display_name = { text: display_name }; // eslint-disable-line camelcase
      reducedItems.substitute = { text: substitute };
      rowItems.push(reducedItems);
    });

    return rowItems;
  };

  const [state, setState] = useState({
    isModalOpen: false,
    selectedRowId: undefined,
    rows: transformedRows(),
    formKey: true,
    isSchemaModified: false,
  });

  const handleModalClose = () => {
    setState((s) => ({ ...s, isModalOpen: false, selectedRowId: undefined }));
  };

  const formatFieldValues = (field, rowId) => {
    if (!field || typeof field !== 'object') {
      return [];
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
        return '********';
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

  const buildSavePayload = (rows, deletedIds) => ({
    fields: rows.map((row, i) => ({
      id: row.field_id || null,
      name: extractFieldName(row.name),
      aetype: cellText(row.aetype),
      datatype: cellText(row.datatype),
      default_value: cellText(row.default_value),
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

  const onModalSubmit = (values) => {
    const isEdit = state.selectedRowId !== undefined;
    const rowId = isEdit ? state.selectedRowId : state.rows.length;
    const existingRow = isEdit ? state.rows[state.selectedRowId] : null;
    const fieldId = existingRow ? existingRow.field_id : null;

    const formatted = formatFieldValues({ ...values, id: fieldId }, rowId);

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

  const onSchemaSave = () => {
    const payload = buildSavePayload(state.rows, deletedFieldIds);
    http.post(`/miq_ae_class/update_fields/${aeClassId}?button=save`, payload, { skipErrors: [400] })
      .then((response) => {
        if (response.status === 200) {
          miqRedirectBack(__(response.message), 'success', '/miq_ae_class/explorer');
        } else {
          miqSparkleOff();
          miqFlash('error', response.error);
        }
      })
      .catch(miqSparkleOff);
  };

  const onSchemaReset = () => {
    http.post(`/miq_ae_class/update_fields/${aeClassId}?button=reset`, {}, { skipErrors: [400] })
      .then((response) => {
        if (response.status === 200) {
          setDeletedFieldIds([]);
          setState((prev) => ({
            ...prev,
            isSchemaModified: !prev.isSchemaModified,
            rows: (response.fields || []).map((f, i) => formatFieldValues(f, i)),
          }));
          miqFlash('warning', __(response.message));
        } else {
          miqFlash('error', response.error);
        }
      })
      .catch(miqSparkleOff);
  };

  const onCancel = () => {
    http.post(`/miq_ae_class/update_fields/${aeClassId}?button=cancel`, {}, { skipErrors: [400] })
      .then((response) => {
        if (response.status === 200) {
          miqRedirectBack(__(response.message), 'success', '/miq_ae_class/explorer');
        } else {
          miqFlash('error', response.error);
        }
      })
      .catch(miqSparkleOff);
  };

  return (
    <>
      <MiqFormRenderer
        schema={createSchemaEditSchema(state.rows, setState, state.isSchemaModified, onFieldDelete)}
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
        <MiqFormRenderer
          key={state.formKey}
          schema={createClassFieldsSchema(
            aeClassId,
            state.selectedRowId,
            aeTypeOptions,
            dTypeOptions,
            state.rows[state.selectedRowId],
          )}
          onSubmit={onModalSubmit}
          onCancel={handleModalClose}
          canReset
          disableSubmit={['invalid']}
          buttonsLabels={{ submitLabel: __('Save') }}
        />
      </Modal>
    </>
  );
};

ClassFieldsEditor.propTypes = {
  aeClassId: PropTypes.number.isRequired,
  initialData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  aeTypeOptions: PropTypes.arrayOf(PropTypes.shape({})),
  dTypeOptions: PropTypes.arrayOf(PropTypes.shape({})),
};

ClassFieldsEditor.defaultProps = {
  aeTypeOptions: [],
  dTypeOptions: [],
};
