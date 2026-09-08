import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Modal, InlineNotification } from '@carbon/react';
import MiqFormRenderer, { FormSpy } from '../../../forms/data-driven-form';
import { getRefreshEnabledFields, fieldValuesToArray, isoToDatePickerValue, extractTimeFromDateTime, combineDateAndTime } from '../helper';
import buildFieldSchema from './fields.schema';

// Convert the [Date] / Date / 'm/d/yyyy' string that DDF submits back to 'YYYY-MM-DD'.
const datePickerValueToIso = (value) => {
  let date;
  if (Array.isArray(value)) date = value[0];
  else if (value instanceof Date) date = value;
  else if (typeof value === 'string' && value) {
    const [mo, dy, yr] = value.split('/').map(Number);
    if (mo && dy && yr) date = new Date(yr, mo - 1, dy);
  }
  if (!date || Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

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
export const buildInitialValues = (field) => {
  // DDF resolves dot-notation field names (e.g. `options.sort_by`) using final-form's `getIn`,
  // which does a nested lookup: initialValues.options.sort_by — NOT initialValues['options.sort_by'].
  // So we must supply a nested `options` object, not flat string keys.
  const opts = field.options || {};
  // automation_type is UI-only and not persisted by the API. Detect it from the saved
  // resource_action shape: presence of configuration_script_id means workflow.
  const ra = field.resource_action || {};
  const detectedAutomationType = ra.configuration_script_id ? 'embedded_workflow' : 'embedded_automate';
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

    // Nested options object — must match the dot-notation DDF field names exactly.
    options: {
      protected: opts.protected || false,
      force_multi_value: opts.force_multi_value || false,
      force_single_value: opts.force_single_value || false,
      sort_by: opts.sort_by || 'description',
      sort_order: opts.sort_order || 'ascending',
      show_past_dates: opts.show_past_dates || false,
      category_id: String(opts.category_id || ''),
      // D10: needed for Single Value switch conditional visibility
      category_single_value: opts.category_single_value || false,
    },

    // Validation
    validator_type: field.validator_type || false,
    validator_rule: field.validator_rule || '',
    validator_message: field.validator_message || '',

    // Tab 3 advanced
    reconfigurable: field.reconfigurable || false,

    // Entry point — resource_action_workflow mirrors resource_action for the workflow variant
    // (avoids duplicate React key since both fields share the same DDF name otherwise)
    resource_action: field.resource_action || { resource_type: 'DialogField', ae_attributes: {} },
    resource_action_workflow: field.resource_action || { resource_type: 'DialogField', ae_attributes: {} },

    // automation_type UI-only helper (strip on save).
    // Falls back to detection from resource_action when loading from the API.
    automation_type: field.automation_type || detectedAutomationType,
  };

  // CheckBox: convert 't'/'f' to boolean for DDF switch
  if (field.type === 'DialogFieldCheckBox') {
    values.default_value = field.default_value === 't';
  } else if (field.type === 'DialogFieldDateControl') {
    // Carbon date-picker needs a [Date] array, not a raw ISO string
    values.default_value = isoToDatePickerValue(field.default_value);
  } else if (field.type === 'DialogFieldDateTimeControl') {
    // Split combined 'YYYY-MM-DD HH:MM' into separate date and time fields for the modal
    values.default_value = isoToDatePickerValue(field.default_value);
    values.default_value_time = extractTimeFromDateTime(field.default_value);
  } else if (Array.isArray(field.default_value)) {
    // Multiselect Dropdown stores default_value as an array — preserve it as-is
    values.default_value = field.default_value;
  } else {
    values.default_value = field.default_value || '';
  }

  // Dropdown / RadioButton: convert values [[v,d],...] to [{value,description},...] for FIELD_ARRAY.
  // values_sorted mirrors values for the non-draggable conditional variant (avoids duplicate React keys).
  if (field.type === 'DialogFieldDropDownList' || field.type === 'DialogFieldRadioButton') {
    const converted = (field.values || []).map((v) =>
      Array.isArray(v) ? { value: v[0], description: v[1] } : v
    );
    values.values = converted;
    values.values_sorted = converted;
  }

  return values;
};

/**
 * Map the DDF submitted values back to the canonical field shape for the store.
 * Reverses the conversions done in buildInitialValues.
 */
export const normaliseSubmitted = (submitted, fieldType, categories = []) => {
  const result = { ...submitted };

  // final-form stores dot-notation field names as genuinely nested objects:
  // e.g. field name 'options.sort_by' → submitted.options.sort_by (not submitted['options.sort_by']).
  const opts = submitted.options || {};

  // D10: resolve category side-effect fields from the selected category object
  const selectedCategoryId = String(opts.category_id || '');
  const selectedCategory = categories.find((c) => String(c.id) === selectedCategoryId);

  // Rebuild the canonical options object from the nested values final-form provides.
  result.options = {
    protected: opts.protected || false,
    force_multi_value: opts.force_multi_value || false,
    force_single_value: opts.force_single_value || false,
    sort_by: opts.sort_by || 'description',
    sort_order: opts.sort_order || 'ascending',
    show_past_dates: opts.show_past_dates || false,
    category_id: selectedCategoryId,
    // D10: Angular's setupCategoryOptions side-effects
    ...(selectedCategory ? {
      category_name: selectedCategory.name,
      category_description: selectedCategory.description,
      category_single_value: selectedCategory.single_value || false,
    } : {}),
    // Preserve existing category_single_value when no matching category found (e.g. initial load)
    ...(!selectedCategory && opts.category_single_value
      ? { category_single_value: opts.category_single_value }
      : {}),
  };
  // Remove the now-redundant flat dot-notation keys (belt-and-suspenders; final-form
  // should not produce them, but guard in case of mixed initialValues shapes).
  Object.keys(result).forEach((k) => {
    if (k.startsWith('options.')) delete result[k];
  });

  // CheckBox: convert boolean back to 't'/'f'
  if (fieldType === 'DialogFieldCheckBox') {
    result.default_value = result.default_value ? 't' : 'f';
  }

  // DateControl: convert [Date] / Date / 'm/d/yyyy' back to 'YYYY-MM-DD'
  if (fieldType === 'DialogFieldDateControl') {
    result.default_value = datePickerValueToIso(result.default_value);
  }

  // DateTimeControl: recombine date + time fields back into 'YYYY-MM-DD HH:MM'
  if (fieldType === 'DialogFieldDateTimeControl') {
    const dateStr = datePickerValueToIso(result.default_value);
    const timeStr = result.default_value_time || '';
    result.default_value = combineDateAndTime(dateStr, timeStr);
    delete result.default_value_time;
  }

  // Dropdown/RadioButton: convert [{value,description},...] back to [[v,d],...]
  // values_sorted is a UI alias for the non-draggable conditional variant — merge whichever is populated.
  if (fieldType === 'DialogFieldDropDownList' || fieldType === 'DialogFieldRadioButton') {
    const source = (result.values_sorted && result.values_sorted.length > 0 && result.options.sort_by !== 'none')
      ? result.values_sorted
      : result.values;
    result.values = fieldValuesToArray(source || []);
    delete result.values_sorted;
  }

  // Automate: if resource_action is still a tree-selection object (element.metadata.fqname),
  // convert fqname → ae_namespace / ae_class / ae_instance so the API can persist it.
  // The fqname is always the domain-prefixed form: /Domain/Namespace[/...]/ Class/Instance
  // domain_fqname strips the leading domain segment: /Namespace[/...]/Class/Instance.
  // Segments: [namespace_parts..., class, instance] — last = instance, second-last = class, rest = namespace.
  // For nodes that are MiqAeClass (no instance), only namespace + class are set.
  if (result.resource_action && result.resource_action.element && result.resource_action.element.metadata) {
    const meta = result.resource_action.element.metadata;
    // Prefer domain_fqname (strips domain prefix); fall back to full fqname.
    const fqname = meta.domain_fqname || meta.fqname || '';
    // Strip leading slash and split into path segments.
    const parts = fqname.replace(/^\//, '').split('/').filter(Boolean);
    const existingRa = result.resource_action;
    if (parts.length >= 3) {
      // At least namespace / class / instance
      const ae_instance = parts[parts.length - 1];
      const ae_class = parts[parts.length - 2];
      const ae_namespace = parts.slice(0, parts.length - 2).join('/');
      result.resource_action = {
        ...(existingRa.resource_type !== undefined ? { resource_type: existingRa.resource_type } : {}),
        ...(existingRa.ae_attributes !== undefined ? { ae_attributes: existingRa.ae_attributes } : {}),
        ...(existingRa.id !== undefined ? { id: existingRa.id } : {}),
        ae_namespace,
        ae_class,
        ae_instance,
      };
    } else if (parts.length === 2) {
      // Class node without instance (e.g. /Namespace/Class)
      result.resource_action = {
        ...(existingRa.resource_type !== undefined ? { resource_type: existingRa.resource_type } : {}),
        ...(existingRa.ae_attributes !== undefined ? { ae_attributes: existingRa.ae_attributes } : {}),
        ...(existingRa.id !== undefined ? { id: existingRa.id } : {}),
        ae_namespace: parts[0],
        ae_class: parts[1],
      };
    }
  }

  // resource_action_workflow is a UI alias for the workflow entry point variant — merge back only
  // when the user actually selected a workflow (automation_type === 'embedded_workflow').
  // We cannot rely on resource_action_workflow.id alone because automate resource_action records
  // also carry a DB id, which would cause a false-positive merge and corrupt the automate path.
  if (result.automation_type === 'embedded_workflow' && result.resource_action_workflow) {
    const wf = result.resource_action_workflow;
    const existingRa = result.resource_action || {};
    result.resource_action = {
      resource_type: existingRa.resource_type,
      ae_attributes: existingRa.ae_attributes,
      id: existingRa.id,
      configuration_script_id: wf.configuration_script_id || wf.id,
    };
  }
  delete result.resource_action_workflow;

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

  // D7: track first validation error to show the inline notification bar
  const [validationError, setValidationError] = useState(null);

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

  // FormSpy handler: watch form state for side-effects.
  const handleFormChange = useCallback(({ values, errors }) => {
    // Dynamic toggle side-effect — triggers Tab 4 appear/disappear
    const newDynamic = Boolean(values && values.dynamic);
    if (newDynamic !== isDynamic) {
      setIsDynamic(newDynamic);
    }

    // D7: surface first validation error as inline notification
    const firstError = errors && Object.values(errors).find((e) => e);
    setValidationError(firstError || null);
  }, [isDynamic]);

  if (!isOpen) return null;

  const heading = field.label
    ? sprintf(__('Edit Field "%s"'), field.label)
    : __('Edit Field');

  const handleSave = (submitted) => {
    onSave(normaliseSubmitted(submitted, field.type, categories));
  };

  return (
    <Modal
      open={isOpen}
      modalHeading={heading}
      passiveModal
      preventCloseOnClickOutside
      onRequestClose={onClose}
      size="lg"
    >
      {/* D7: inline error notification — mirrors Angular's dialog-editor-tab-notification */}
      {validationError && (
        <InlineNotification
          kind="error"
          title={validationError}
          lowContrast
          hideCloseButton
          className="edit-field-modal-notification"
        />
      )}
      <MiqFormRenderer
        schema={schema}
        initialValues={initialValues}
        onSubmit={handleSave}
        onCancel={onClose}
        buttonsLabels={{ submitLabel: __('Save') }}
        canReset
      >
        <FormSpy subscription={{ values: true, errors: true }} onChange={handleFormChange} />
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
