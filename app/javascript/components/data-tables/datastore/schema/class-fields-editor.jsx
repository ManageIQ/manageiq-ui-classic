import React, {
  useState, useEffect, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'carbon-components-react';
import MiqFormRenderer from '@@ddf';
import debounce from 'lodash/debounce';
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
      const data = formatFieldValues(values, state.selectedRowId);
      updateState(data);
    } else {
      http.post(`/miq_ae_class/field_accept?button=accept`, values, { skipErrors: [400] })
        .then(() => {
          const data = formatFieldValues(values, state.rows.length);
          updateState(data);
        })
        .catch((error) => {
          // console.error('Failed to save new field:', error);
        });
    }
  };

  const updateFieldValueInState = (fieldName, newValue) => {
    // Update existing field in state attr - rows
    setState((prevState) => {
      const updatedRow = prevState.rows.map((row, index) => {
        if (index === prevState.selectedRowId) {
          return {
            ...row,
            [fieldName]: {
              ...row[fieldName],
              text: newValue,
            },
          };
        }
        return row;
      });

      return {
        ...prevState,
        rows: updatedRow,
      };
    });
  };

  const handleSchemaFieldChange = useCallback(
    debounce((aeClassId, val, fieldName) => {
      let fname;

      if (state.selectedRowId) {
        if (fieldName === 'datatype' || fieldName === 'aetype') {
          fname = `fields_${fieldName}${state.selectedRowId}`;
        } else {
          fname = `fields_${fieldName}_${state.selectedRowId}`;
        }
      } else {
        fname = `field_${fieldName}`;
      }

      const data = {
        [fname]: val,
        id: aeClassId,
      };

      http.post(`/miq_ae_class/fields_form_field_changed/${aeClassId}`, data, {
        skipErrors: [400],
      }).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.error('Error:', error);
        console.error('Response:', error.response);
        console.log('Something went wrong');
      });
    }, 500),
    [aeClassId, state.selectedRowId]
  );

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
            // state.rows.find((row) => row.id === state.selectedRowId),
            handleSchemaFieldChange,
            updateFieldValueInState,
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
