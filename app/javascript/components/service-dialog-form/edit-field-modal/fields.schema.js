import { componentTypes } from '@@ddf';
import {
  fieldInfoFields,
  optionsFields,
  advancedFields,
  overridableOptionsFields,
} from '../dynamic-fields/dynamic-field-configuration';

/**
 * Builds the DDF schema (fields array) for the EditFieldModal.
 *
 * Produces a TABS container with:
 *   Tab 1 — Field Information  (all types)
 *   Tab 2 — Options            (varies by type × dynamic mode)
 *   Tab 3 — Advanced           (all types)
 *   Tab 4 — Overridable Options (only when dynamic === true)
 *
 * @param {string}  type               — Angular type string, e.g. 'DialogFieldTextBox'
 * @param {boolean} isDynamic          — current value of field.dynamic
 * @param {object}  opts               — forwarded to optionsFields()
 *   opts.emsWorkflowsEnabled          — bool
 *   opts.dynamicFields                — array of {name, label} for the Fields-to-Refresh select
 *   opts.defaultValueOptions          — array of {label, value} for Dropdown/Radio default_value select
 *   opts.categories                   — array of category objects for TagControl
 */
const buildFieldSchema = (type, isDynamic, opts = {}) => {
  const showDynamic = type !== 'DialogFieldTagControl';

  const tab1 = {
    component: componentTypes.TAB_ITEM,
    id: 'field-info-tab',
    name: 'field-info-tab',
    label: __('Field Information'),
    fields: fieldInfoFields(showDynamic),
  };

  const tab2 = {
    component: componentTypes.TAB_ITEM,
    id: 'options-tab',
    name: 'options-tab',
    label: __('Options'),
    fields: optionsFields(type, isDynamic, opts),
  };

  const tab3 = {
    component: componentTypes.TAB_ITEM,
    id: 'advanced-tab',
    name: 'advanced-tab',
    label: __('Advanced'),
    fields: advancedFields(),
  };

  const tabs = [tab1, tab2, tab3];

  // Tab 4 is shown only when field is dynamic (never for TagControl which has no dynamic)
  if (isDynamic && showDynamic) {
    tabs.push({
      component: componentTypes.TAB_ITEM,
      id: 'overridable-options-tab',
      name: 'overridable-options-tab',
      label: __('Overridable Options'),
      fields: overridableOptionsFields(type),
    });
  }

  return {
    fields: [
      {
        component: componentTypes.TABS,
        id: 'edit-field-modal-tabs',
        name: 'edit-field-modal-tabs',
        fields: tabs,
      },
    ],
  };
};

export default buildFieldSchema;
