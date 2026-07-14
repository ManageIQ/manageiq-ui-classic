import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '@carbon/react';
import MiqFormRenderer, { FormSpy } from '../../../forms/data-driven-form';
import { getRefreshEnabledFields, fieldValuesToArray } from '../helper';
import buildFieldSchema from './fields.schema';

/**
 * Converts API field values [[v,d],...] / objects [{value,description},...] into
 * DDF-friendly select option arrays for the Default Value select in Dropdown/Radio.
 */
const toDefaultValueOptions = (values) => {
  if (!Array.isArray(values)) return [];
  return values.map((v) => {
    const [val, desc] = Array.isArray(v) ? v : [v.value, v.description];
    return { label: desc || val, value: val };
  });
};

/**
 * Build the DDF initialValues from the field object.
 *
 * Keys in initialValues must match the DDF field `name` paths used in
 * dynamic-field-configuration.js (including nested paths like `options.protected`).
 *
 * Special mappings vs API wire format:
 *   - `validator_type`: stored as `'regex'`/`false` on wire → DDF switch needs truthy/falsy
 *     We pass it through as-is; onSave normalises back.
 *   - `default_value` for CheckBox: `'t'`/`'f'` → switch must be true/false.
 *     We convert on the way in and back out on onSave.
 *   - `values`: `[[v,d],...]` stored as-is; FIELD_ARRAY widget uses `{value, description}` objects.
 *     We convert to objects for DDF and back to arrays on save.
 */
const buildInitialValues = (field) => {
  // Flatten options sub-object into top-level DDF paths (DDF resolves `options.protected` etc.)
  const values = {
    // Tab 1
    label: field.label || '',
    name: field.name || '',
    description: field.description || '',
    dynamic: field.dynamic || false,

    // Tab 2 — common
    required: field.required || false,
    read_only: field.read_only || false,
    visible: field.visible !== false,
    data_type: field.data_type || 'string',
    show_refresh_button: field.show_refresh_button || false,
    load_values_on_init: field.load_values_on_init !== false,
    dialog_field_responders: field.dialog_field_responders || [],

    // Nested options (DDF resolves dot-notation paths)
    'options.protected': (field.options && field.options.protected) || false,
    'options.force_multi_value': (field.options && field.options.force_multi_value) || false,
    'options.force_single_value': (field.options && field.options.force_single_value) || false,
    'options.sort_by': (field.options && field.options.sort_by) || 'description',
    'options.sort_order': (field.options && field.options.sort_order) || 'ascending',
    'options.show_past_dates': (field.options && field.options.show_past_dates) || false,
    'options.category_id': (field.options && String(field.options.category_id || '')) || '',

    // Validation
    validator_type: field.validator_type || false,
    validator_rule: field.validator_rule || '',
    validator_message: field.validator_message || '',

    // Tab 3 advanced
    reconfigurable: field.reconfigurable || false,

    // Entry point
    resource_action: field.resource_action || { resource_type: 'DialogField', ae_attributes: {} },

    // automation_type UI-only helper (strip on save)
    automation_type: field.automation_type || 'embedded_automate',
  };

  // CheckBox: convert 't'/'f' to boolean for DDF switch
  if (field.type === 'DialogFieldCheckBox') {
    values.default_value = field.default_value === 't';
  } else {
    values.default_value = field.default_value || '';
  }

  // Dropdown / RadioButton: convert values [[v,d],...] to [{value,description},...] for FIELD_ARRAY
  if (field.type === 'DialogFieldDropDownList' || field.type === 'DialogFieldRadioButton') {
    values.values = (field.values || []).map((v) =>
      Array.isArray(v) ? { value: v[0], description: v[1] } : v
    );
  }

  return values;
};

/**
 * Map the DDF submitted values back to the canonical field shape for the store.
 * Reverses the conversions done in buildInitialValues.
 */
const normaliseSubmitted = (submitted, fieldType) => {
  const result = { ...submitted };

  // Restore nested options object from DDF dot-notation
  result.options = {
    protected: submitted['options.protected'] || false,
    force_multi_value: submitted['options.force_multi_value'] || false,
    force_single_value: submitted['options.force_single_value'] || false,
    sort_by: submitted['options.sort_by'] || 'description',
    sort_order: submitted['options.sort_order'] || 'ascending',
    show_past_dates: submitted['options.show_past_dates'] || false,
    category_id: submitted['options.category_id'] || '',
  };
  // Remove flat dot-notation keys
  Object.keys(result).forEach((k) => {
    if (k.startsWith('options.')) delete result[k];
  });

  // CheckBox: convert boolean back to 't'/'f'
  if (fieldType === 'DialogFieldCheckBox') {
    result.default_value = result.default_value ? 't' : 'f';
  }

  // Dropdown/RadioButton: convert [{value,description},...] back to [[v,d],...]
  if (fieldType === 'DialogFieldDropDownList' || fieldType === 'DialogFieldRadioButton') {
    result.values = fieldValuesToArray(result.values || []);
  }

  // validator_type: DDF switch value will be a bool true/false; normalise to 'regex'/false
  if (result.validator_type === true) result.validator_type = 'regex';
  else if (!result.validator_type) result.validator_type = false;

  // automation_type is UI-only — keep on the field object in store (stripped on API save by sanitiseField)
  return result;
};

/**
 * EditFieldModal — Carbon Modal wrapping a tabbed MiqFormRenderer.
 *
 * Props:
 *   isOpen           — bool
 *   field            — full field object from dialog store
 *   dialogData       — full dialog data (to build the refreshable fields list)
 *   emsWorkflowsEnabled — bool
 *   categories       — array of API category objects (fetched by DynamicTagControl)
 *   onSave(updated)  — called with merged updated field props
 *   onClose()        — called on Cancel
 */
const EditFieldModal = ({
  isOpen,
  field,
  dialogData,
  emsWorkflowsEnabled,
  categories,
  onSave,
  onClose,
}) => {
  // Track the current `dynamic` value as seen by FormSpy so the schema can
  // react to the toggle without requiring a full remount.
  const [isDynamic, setIsDynamic] = useState(field.dynamic || false);

  // Build refresh-eligible field list (all dynamic fields except this one)
  const dynamicFields = useMemo(
    () => getRefreshEnabledFields(dialogData || { dialog_tabs: [] }, field.name),
    [dialogData, field.name]
  );

  // Build default_value options for Dropdown / RadioButton select
  const defaultValueOptions = useMemo(
    () => toDefaultValueOptions(field.values),
    [field.values]
  );

  // Build schema — memoised on the dependencies that can change it.
  // Do NOT include the full `field` object or every keystroke will remount DDF.
  const schema = useMemo(
    () => buildFieldSchema(field.type, isDynamic, {
      emsWorkflowsEnabled,
      dynamicFields,
      defaultValueOptions,
      categories,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field.type, isDynamic, emsWorkflowsEnabled, dynamicFields, defaultValueOptions, categories]
  );

  // Build initial values once — these don't change while the modal is open
  const initialValues = useMemo(() => buildInitialValues(field), [field]);

  // FormSpy handler: watch the `dynamic` field for side-effects (tab 4 toggle).
  // Must be read-only — never call setFormValues from here.
  const handleFormChange = useCallback(({ values }) => {
    const newDynamic = Boolean(values && values.dynamic);
    if (newDynamic !== isDynamic) {
      setIsDynamic(newDynamic);
    }
  }, [isDynamic]);

  if (!isOpen) return null;

  const heading = field.label
    ? sprintf(__('Edit Field "%s"'), field.label)
    : __('Edit Field');

  const handleSave = (submitted) => {
    const normalised = normaliseSubmitted(submitted, field.type);
    onSave(normalised);
  };

  return (
    <Modal
      open={isOpen}
      modalHeading={heading}
      passiveModal
      onRequestClose={onClose}
      size="lg"
    >
      <MiqFormRenderer
        schema={schema}
        initialValues={initialValues}
        onSubmit={handleSave}
        onCancel={onClose}
        buttonsLabels={{ submitLabel: __('Save') }}
        canReset
      >
        <FormSpy subscription={{ values: true }} onChange={handleFormChange} />
      </MiqFormRenderer>
    </Modal>
  );
};

EditFieldModal.propTypes = {
  isOpen: PropTypes.bool,
  field: PropTypes.object.isRequired,
  dialogData: PropTypes.object,
  emsWorkflowsEnabled: PropTypes.bool,
  categories: PropTypes.array,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

EditFieldModal.defaultProps = {
  isOpen: false,
  dialogData: undefined,
  emsWorkflowsEnabled: false,
  categories: [],
};

export default EditFieldModal;
