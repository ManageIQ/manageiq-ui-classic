import { useState, useEffect, useRef } from 'react';
import { useFieldApi, useFormApi } from '@@ddf';
import type { UseFieldApiConfig } from '@data-driven-forms/react-form-renderer';
import {
  FilterableMultiSelect, InlineNotification, Loading, Modal,
} from '@carbon/react';
import SortableList from '../sortable-list';
import { useFieldMetadata } from './field-metadata-context';
import type { AvailableField, FieldMetadata } from './report-editor-types';
import { MAX_COLUMNS, WARN_COLUMNS } from './validation';

type FieldsResponse = {
  fields?: AvailableField[];
  field_metadata?: FieldMetadata;
};

const FieldPicker = (props: UseFieldApiConfig) => {
  const { input: { value: colOrder = [] as string[], onChange }, meta } = useFieldApi(props);
  const { input: { value: model = '' } } = useFieldApi({ name: 'model' });
  const formOptions = useFormApi();
  const { availableFields: contextFields, setFieldData } = useFieldMetadata();

  const [pendingClear, setPendingClear] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<(() => void) | null>(null);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [availableFields, setAvailableFields] = useState<AvailableField[]>(contextFields);
  const prevModelRef = useRef<string | undefined>(undefined);
  // Incremented per fetch so a slow response for a previous model can't overwrite the current one.
  const latestRequestRef = useRef(0);

  const applySelection = (newIds: string[], fields: AvailableField[] = availableFields) => {
    formOptions.change('col_order', newIds);
    type ColOptionsMap = Record<string, { header?: string; format?: string }>;
    const formValues = formOptions.getState().values as Record<string, ColOptionsMap>;
    const colOptions: ColOptionsMap = formValues.col_options || {};
    const labelMap = Object.fromEntries(fields.map(([label, id]) => [id, label]));
    const nextColOptions = Object.fromEntries(
      newIds.map((id: string) => [id, colOptions[id] || { header: labelMap[id] || '', format: '' }]),
    );
    formOptions.change('col_options', nextColOptions);
  };

  const fetchFieldsForModel = (m: string) => {
    latestRequestRef.current += 1;
    const requestId = latestRequestRef.current;
    if (!m) {
      setAvailableFields([]);
      setFieldsLoading(false);
      setFieldData({ availableFields: [], fieldMetadata: {} });
      return;
    }
    setFieldsLoading(true);
    http.get<FieldsResponse>(`/report/available_fields?model=${encodeURIComponent(m)}`)
      .then((data) => {
        if (requestId !== latestRequestRef.current) {
          return;
        }
        const fields = data.fields || [];
        setAvailableFields(fields);
        setFieldsLoading(false);
        setFieldData({ availableFields: fields, fieldMetadata: data.field_metadata || {} });
      })
      .catch(() => {
        if (requestId !== latestRequestRef.current) {
          return;
        }
        setAvailableFields([]);
        setFieldsLoading(false);
        setFieldData({ availableFields: [], fieldMetadata: {} });
      });
  };

  // Deliberately keyed on `model` only: the body uses refs and reads the form state fresh via
  // formOptions.getState(), so the re-created helpers never go stale. Adding them would refetch every render.
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

    const { values, initialValues } = formOptions.getState() as {
      values: Record<string, unknown>;
      initialValues: Record<string, unknown>;
    };
    const currentColOrder = (values.col_order as string[]) || [];
    const initialColOrder = (initialValues.col_order as string[]) || [];
    // A form reset restores the model and the columns together; the columns are then the saved ones, so there is nothing to confirm.
    const isBackToInitial = model === initialValues.model
      && currentColOrder.length === initialColOrder.length
      && currentColOrder.every((id, index) => id === initialColOrder[index]);
    if (currentColOrder.length > 0 && !isBackToInitial) {
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

  // FilterableMultiSelect only reads initialSelectedItems on mount, so `pickerKey` is used as its `key`
  // to remount it when the selection changes from outside: new available fields, or a shrinking col_order.
  // `prevColOrderLenRef` tracks the previous length to detect shrinking; growth comes from the dropdown itself.
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

  const handleSelectionChange = ({ selectedItems: newSelection }: { selectedItems: { id: string; label: string }[] }) => {
    const newIds = newSelection.map((i: { id: string }) => i.id);

    const added = newIds.filter((id: string) => !colOrder.includes(id));
    const kept = colOrder.filter((id: string) => newIds.includes(id));
    applySelection([...kept, ...added]);
  };

  const handleReorder = (newOrder: string[]) => {
    onChange(newOrder);
  };

  const handleRemove = (fieldId: string) => {
    applySelection(colOrder.filter((id: string) => id !== fieldId));
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

        {count === 0 && (meta.touched || meta.submitFailed) && meta.error && (
          <InlineNotification
            kind="error"
            title={__('Field selection required')}
            subtitle={meta.error}
            hideCloseButton
            lowContrast
          />
        )}

        {colOrder.length > 0 ? (
          <SortableList
            input={{ value: colOrder, onChange: handleReorder as () => void }}
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
