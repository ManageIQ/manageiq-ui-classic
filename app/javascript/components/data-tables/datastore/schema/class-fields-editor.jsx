import React, {
  useState, useEffect,
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
      id, field_id, cells, clickable,
    }) => {
      // eslint-disable-next-line camelcase
      const fieldId = field_id;
      const reducedItems = cells.reduce((result, item, index) => {
        result[headers[index].name] = item;
        result.id = fieldId.toString();
        result.field_id = fieldId;
        result.clickable = clickable;
        return result;
      }, {});
      rowItems.push(reducedItems);
    });

    return rowItems;
  };

  const [state, setState] = useState({
    isModalOpen: false,
    selectedRowId: undefined,
    rows: transformedRows(),
    formKey: true, // for remounting
    isSchemaModified: false,
  });

  useEffect(() => {
    setState((state) => ({ ...state, isSchemaModified: !state.isSchemaModified }));
  }, [state.rows]);

  const handleModalClose = () => {
    setState((state) => ({ ...state, isModalOpen: false, selectedRowId: undefined }));
  };

  const formatFieldValues = (field, rowId) => {
    if (!field || typeof field !== 'object') return [];

    const getFieldName = () => ((field.display_name) ? `${field.display_name} (${field.name})` : `${field.name}`);

    const getIconForValue = () => {
      const aeMatch = aeTypeOptions.find((option) => option[1] === field.aetype);
      const aeTypeIcon = (aeMatch && aeMatch[2] && aeMatch[2]['data-icon']) || '';

      const dtypeMatch = dTypeOptions.find((option) => option[1] === field.datatype);
      const dTypeIcon = (dtypeMatch && dtypeMatch[2] && dtypeMatch[2]['data-icon']) || '';

      const subIcon = (field.substitute) ? 'pficon pficon-ok' : 'pficon pficon-close';

      return [aeTypeIcon, dTypeIcon, subIcon];
    };

    const row = {
      id: rowId.toString(),
      field_id: field.id,
      name: {
        text: getFieldName(),
        icon: getIconForValue() || [],
        // raw: field.name, // Store the raw name value for modal editing
      },
      aetype: { text: field.aetype },
      datatype: { text: field.datatype },
      default_value: { text: field.default_value || '' },
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
        is_button: true,
        text: __('Update'),
        kind: 'tertiary',
        size: 'md',
        callback: 'editClassField',
      },
      delete: {
        is_button: true,
        text: __('Delete'),
        kind: 'danger',
        size: 'md',
        callback: 'deleteClassField',
      },
    };

    return row;
  };

  const onModalSubmit = (values) => {
    const isEdit = state.selectedRowId !== undefined;

    const updateState = (newData) => {
      setState((prevState) => ({
        ...prevState,
        rows: isEdit
          ? prevState.rows.map((field) => (field.id === newData.id ? newData : field))
          : [...prevState.rows, newData],
      }));
      handleModalClose();
    };

    if (isEdit) {
      const existingRow = state.rows[state.selectedRowId];
      const valuesWithId = {
        ...values,
        id: existingRow.field_id,
      };

      // Build indexed parameters for backend
      const fieldIndex = state.selectedRowId;
      const data = {
        id: aeClassId,
        [`fields_name_${fieldIndex}`]: values.name,
        [`fields_aetype${fieldIndex}`]: values.aetype,
        [`fields_datatype${fieldIndex}`]: values.datatype,
        [`fields_default_value_${fieldIndex}`]: values.default_value || '',
        [`fields_display_name_${fieldIndex}`]: values.display_name || '',
        [`fields_description_${fieldIndex}`]: values.description || '',
        [`fields_substitute_${fieldIndex}`]: values.substitute,
        [`fields_collect_${fieldIndex}`]: values.collect || '',
        [`fields_message_${fieldIndex}`]: values.message || '',
        [`fields_on_entry_${fieldIndex}`]: values.on_entry || '',
        [`fields_on_exit_${fieldIndex}`]: values.on_exit || '',
        [`fields_on_error_${fieldIndex}`]: values.on_error || '',
        [`fields_max_retries_${fieldIndex}`]: values.max_retries || '',
        [`fields_max_time_${fieldIndex}`]: values.max_time || '',
      };

      http.post(`/miq_ae_class/fields_form_field_changed/${aeClassId}`, data, { skipErrors: [400] })
        .then(() => {
          const formattedData = formatFieldValues(valuesWithId, existingRow.id);
          updateState(formattedData);
        })
        .catch((_err) => {
        });
    } else {
      // For new fields, call backend to add to session
      http.post(`/miq_ae_class/field_accept?button=accept`, values, { skipErrors: [400] })
        .then(() => {
          const data = formatFieldValues(values, state.rows.length);
          updateState(data);
        })
        .catch((_err) => {
        });
    }
  };

  const onSchemaReset = () => {
    http.post(`/miq_ae_class/update_fields/${aeClassId}?button=reset`, { skipErrors: [400] })
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

  const onSchemaSave = () => {
    http.post(`/miq_ae_class/update_fields/${aeClassId}?button=save`, { skipErrors: [400] })
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

  // On cancelling the edit schema action
  const onCancel = () => {
    http.post(`/miq_ae_class/update_fields/${aeClassId}?button=cancel`, { skipErrors: [400] })
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

  return (
    <>

      <MiqFormRenderer
        schema={createSchemaEditSchema(state.rows, setState, state.isSchemaModified)}
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
  initialData: PropTypes.arrayOf(PropTypes.any).isRequired,
  aeTypeOptions: PropTypes.arrayOf(PropTypes.any),
  dTypeOptions: PropTypes.arrayOf(PropTypes.any),
};

ClassFieldsEditor.defaultProps = {
  aeTypeOptions: [],
  dTypeOptions: [],
};
