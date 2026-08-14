// Carbon Design System replacements for react-querybuilder v8 control slots.
import {
  Checkbox,
  Select,
  SelectItem,
  Button,
  TextInput,
  Toggle,
} from '@carbon/react';
import {
  Copy,
  ChevronUp,
  ChevronDown,
  Add,
  SubtractAlt
} from '@carbon/react/icons';

// Flatten RQB option lists: handles both flat arrays and optgroup arrays.
const flatOptions = (options) => {
  if (!Array.isArray(options)) {
    return [];
  }
  return options.flatMap((o) => (o.options ? o.options : [o]));
};

// Return a renderIcon function for icon-only buttons; undefined for labelled buttons.
const iconComponentForLabel = (label) => {
  if (!label) {
    return undefined;
  }
  const s = String(label).toLowerCase();
  if (s.includes('remove') || s.includes('delete')) {
    return (props) => <SubtractAlt size={16} {...props} />;
  }
  if (s.includes('clone') || s.includes('copy')) {
    return (props) => <Copy size={16} {...props} />;
  }
  if (/\bup\b/.test(s)) {
    return (props) => <ChevronUp size={16} {...props} />;
  }
  if (/\bdown\b/.test(s)) {
    return (props) => <ChevronDown size={16} {...props} />;
  }
  return undefined;
};

// Labels RQB passes for the add-rule / add-group action slots.
const ADD_BUTTON_MAP = {
  '+ rule': { display: __('Add Rule'), kind: 'primary' },
  '+ group': { display: __('Add Sub-Group'), kind: 'secondary' },
};

const AddIcon = (props) => <Add size={16} {...props} />;

export const ActionButton = ({
  label,
  title,
  handleOnClick,
  disabled,
  className,
}) => {
  const labelStr = String(label ?? title ?? '');
  // Match on title too — RQB default labels are symbols
  const matchStr = `${labelStr} ${String(title ?? '')}`.toLowerCase();
  const icon = iconComponentForLabel(matchStr);

  const addBtn = !icon && ADD_BUTTON_MAP[labelStr.toLowerCase()];

  return (
    <Button
      kind={addBtn ? addBtn.kind : 'ghost'}
      size="sm"
      iconDescription={title || labelStr}
      renderIcon={addBtn ? AddIcon : icon}
      hasIconOnly={!!icon}
      onClick={handleOnClick}
      disabled={disabled}
      className={className}
      tooltipAlignment="end"
    >
      {!icon && (addBtn ? addBtn.display : label)}
    </Button>
  );
};

export const CombinatorSelector = ({
  options,
  value,
  handleOnChange,
  disabled,
  className,
  title,
  path,
}) => (
  <Select
    id={`combinator-${(path || []).join('-') || 'root'}`}
    hideLabel
    labelText={title || __('Combinator')}
    size="sm"
    value={value}
    disabled={disabled}
    className={className}
    onChange={(e) => handleOnChange(e.target.value)}
  >
    {flatOptions(options).map((o) => {
      const val = String(o.name ?? o.value ?? '');
      return <SelectItem key={val} value={val} text={o.label} />;
    })}
  </Select>
);

// Alias checkbox + text input rendered in the value row, after the value editor.
const AliasRow = ({
  rule, context, disabled, fieldData,
}) => {
  if (!rule || !context || !context.showAlias) {
    return null;
  }
  const { updateRuleAlias } = context;
  const colType = fieldData && fieldData.colType;
  if (colType === 'regkey' || colType === 'find') {
    return null;
  }

  const ruleId = rule.id;
  const hasAlias = rule.alias !== undefined && rule.alias !== null;

  return (
    <div className="exp-alias-row">
      <div className="exp-alias-checkbox">
        <Checkbox
          id={`alias-enable-${ruleId}`}
          labelText={__('Alias')}
          checked={hasAlias}
          disabled={disabled}
          onChange={(_, { checked }) => {
            if (updateRuleAlias) {
              updateRuleAlias(ruleId, checked ? (rule.alias || '') : null);
            }
          }}
        />
      </div>
      {hasAlias && (
        <TextInput
          id={`alias-text-${ruleId}`}
          hideLabel
          labelText={__('Alias label')}
          placeholder={__('Display label')}
          size="sm"
          value={rule.alias || ''}
          disabled={disabled}
          onChange={(e) => {
            if (updateRuleAlias) {
              updateRuleAlias(ruleId, e.target.value);
            }
          }}
        />
      )}
    </div>
  );
};

export const OperatorSelector = ({
  options,
  value,
  handleOnChange,
  disabled,
  className,
  title,
  path,
  field,
}) => {
  if (!field) {
    return null;
  }

  const flat = flatOptions(options);

  // No operators (e.g. find fields manage their own operator internally).
  if (flat.length === 0) {
    return null;
  }

  // Single-operator fields (e.g. tags always use CONTAINS) — show a static label.
  if (flat.length === 1) {
    return (
      <span className={`exp-operator-label${className ? ` ${className}` : ''}`}>
        {flat[0].label}
      </span>
    );
  }

  return (
    <Select
      id={`operator-${(path || []).join('-')}`}
      hideLabel
      labelText={title || __('Operator')}
      size="sm"
      value={value}
      disabled={disabled}
      className={className}
      onChange={(e) => handleOnChange(e.target.value)}
    >
      {flat.map((o) => {
        const val = String(o.name ?? o.value ?? '');
        return <SelectItem key={val} value={val} text={o.label} />;
      })}
    </Select>
  );
};

// Re-export AliasRow so CarbonValueEditor can render it in the value row.
export { AliasRow };

// Carbon Toggle with inline label span so "Not" sits beside the pill in the flex header row.
// (Setting labelText on Toggle directly stacks it above the pill as a block element.)
export const NotToggle = ({
  checked,
  handleOnChange,
  disabled,
  label,
  className,
  path,
}) => {
  const labelStr = label !== undefined && label !== null ? String(label) : __('NOT').toUpperCase();
  return (
    <span className={`exp-not-toggle${className ? ` ${className}` : ''}`}>
      <span className="exp-not-toggle__label" aria-hidden="true">{labelStr}</span>
      <Toggle
        id={`not-toggle-${(path || []).join('-') || 'root'}`}
        aria-label={labelStr}
        size="sm"
        hideLabel
        labelA=""
        labelB=""
        toggled={!!checked}
        onToggle={handleOnChange}
        disabled={disabled}
      />
    </span>
  );
};
