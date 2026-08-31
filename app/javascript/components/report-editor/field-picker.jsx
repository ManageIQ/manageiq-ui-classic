import { useState, useEffect, useRef } from 'react';
import { useFieldApi, useFormApi } from '@@ddf';
import {
  FilterableMultiSelect, InlineNotification, Loading, Modal,
} from '@carbon/react';
import SortableList from '../sortable-list';
import { useFieldMetadata } from './field-metadata-context';

const MAX_COLUMNS = 100;
const WARN_COLUMNS = 80;

const FieldPicker = (props) => {
  const { input: { value: colOrder = [], onChange } } = useFieldApi(props);
  const { input: { value: modelRaw = '' } } = useFieldApi({ name: 'model' });
  const model = modelRaw?.value ?? modelRaw;
  const formOptions = useFormApi();
  const { availableFields: contextFields, setFieldData } = useFieldMetadata();

  const [pendingClear, setPendingClear] = useState(false);
  const [pendingSelection, setPendingSelection] = useState(null);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [availableFields, setAvailableFields] = useState(contextFields);
  const prevModelRef = useRef(undefined);

  const applySelection = (newIds, fields = availableFields) => {
    onChange(newIds);
    const colOptions = formOptions.getState().values.col_options || {};
    const labelMap = Object.fromEntries(fields.map(([label, id]) => [id, label]));
    const nextColOptions = Object.fromEntries(
      newIds.map((id) => [id, colOptions[id] || { header: labelMap[id] || '', format: '' }]),
    );
    formOptions.change('col_options', nextColOptions);
  };

  const fetchFieldsForModel = (m) => {
    if (!m) {
      setAvailableFields([]);
      setFieldData({ availableFields: [], fieldMetadata: {} });
      return;
    }
    setFieldsLoading(true);
    http.get(`/report/react_available_fields?model=${encodeURIComponent(m)}`)
      .then((data) => {
        const fields = data.fields || [];
        setAvailableFields(fields);
        setFieldsLoading(false);
        setFieldData({ availableFields: fields, fieldMetadata: data.field_metadata || {} });
      })
      .catch(() => {
        setAvailableFields([]);
        setFieldsLoading(false);
        setFieldData({ availableFields: [], fieldMetadata: {} });
      });
  };

  useEffect(() => {
    if (model === prevModelRef.current) {
      return;
    }
    const previousModel = prevModelRef.current;
    prevModelRef.current = model;

    if (previousModel === undefined) {
      fetchFieldsForModel(model);
      return;
    }

    const currentColOrder = formOptions.getState().values.col_order || [];
    if (currentColOrder.length > 0) {
      setPendingSelection(() => () => {
        applySelection([], []);
        fetchFieldsForModel(model);
      });
      setPendingClear(true);
    } else {
      fetchFieldsForModel(model);
    }
  }, [model]);

  const items = availableFields.map(([label, val]) => ({ id: val, label }));
  const initialSelectedItems = items.filter((i) => colOrder.includes(i.id));

  const prevColOrderLenRef = useRef(colOrder.length);
  const [pickerKey, setPickerKey] = useState(0);
  useEffect(() => {
    setPickerKey((k) => k + 1);
  }, [availableFields]);
  useEffect(() => {
    if (colOrder.length < prevColOrderLenRef.current) {
      setPickerKey((k) => k + 1);
    }
    prevColOrderLenRef.current = colOrder.length;
  }, [colOrder]);

  const handleSelectionChange = ({ selectedItems: newSelection }) => {
    const newIds = newSelection.map((i) => i.id);

    // preserve order: keep existing selections in their current order,
    // then append newly added ones at the end
    const added = newIds.filter((id) => !colOrder.includes(id));
    const kept = colOrder.filter((id) => newIds.includes(id));
    applySelection([...kept, ...added]);
  };

  const handleReorder = (newOrder) => {
    onChange(newOrder);
  };

  const handleRemove = (fieldId) => {
    applySelection(colOrder.filter((id) => id !== fieldId));
  };

  const count = colOrder.length;
  const overLimit = count > MAX_COLUMNS;
  const nearLimit = !overLimit && count > WARN_COLUMNS;

  return (
    <div className="report-editor-field-picker">
      <Modal
        open={pendingClear}
        modalHeading={__('Change model?')}
        primaryButtonText={__('Continue')}
        secondaryButtonText={__('Cancel')}
        onRequestSubmit={() => {
          setPendingClear(false);
          if (pendingSelection) {
            pendingSelection();
          }
          setPendingSelection(null);
        }}
        onRequestClose={() => {
          setPendingClear(false);
          setPendingSelection(null);
        }}
        danger
      >
        <p>{__('Changing the model will clear all selected columns. Continue?')}</p>
      </Modal>

      <div className="report-editor-field-picker__multiselect">
        {fieldsLoading ? (
          <Loading small withOverlay={false} description={__('Loading available fields…')} />
        ) : (
          <FilterableMultiSelect
            key={pickerKey}
            id="report-field-picker"
            titleText={__('Available fields')}
            placeholder={__('Search and select fields...')}
            items={items}
            initialSelectedItems={initialSelectedItems}
            itemToString={(item) => (item ? item.label : '')}
            onChange={handleSelectionChange}
            disabled={!model}
          />
        )}
      </div>

      <div className="report-editor-field-picker__selected">
        <div className="report-editor-field-picker__selected-header">
          <h4 className="report-editor-field-picker__selected-heading">
            {__('Selected fields')}
          </h4>
          <span className={`report-editor-field-picker__count${overLimit ? ' report-editor-field-picker__count--over' : ''}`}>
            {sprintf(__('%s / %s columns'), count, MAX_COLUMNS)}
          </span>
        </div>

        {overLimit && (
          <InlineNotification
            kind="error"
            title={__('Column limit exceeded')}
            subtitle={sprintf(__('Maximum %s columns allowed. Please remove some fields.'), MAX_COLUMNS)}
            hideCloseButton
            lowContrast
          />
        )}
        {nearLimit && (
          <InlineNotification
            kind="warning"
            title={__('Approaching column limit')}
            subtitle={sprintf(__('%s of %s columns selected.'), count, MAX_COLUMNS)}
            hideCloseButton
            lowContrast
          />
        )}

        {colOrder.length > 0 ? (
          <SortableList
            input={{ value: colOrder, onChange: handleReorder }}
            helperText={__('Drag to reorder · click × to remove')}
            labelMap={Object.fromEntries(items.map(({ id, label }) => [id, label]))}
            onRemove={handleRemove}
          />
        ) : (
          <p className="report-editor-field-picker__empty">
            {__('No fields selected yet.')}
          </p>
        )}
      </div>
    </div>
  );
};

export default FieldPicker;
