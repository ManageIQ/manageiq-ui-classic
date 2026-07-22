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
  TrashCan,
  Copy,
  ChevronUp,
  ChevronDown,
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
    return (props) => <TrashCan size={16} {...props} />;
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

export const ActionButton = ({
  label,
  title,
  handleOnClick,
  disabled,
  className,
}) => {
  const labelStr = String(label ?? title ?? '');
  // Match on title too — RQB default labels are symbols ("⨯", "⧉"), not words.
  const matchStr = `${labelStr} ${String(title ?? '')}`.toLowerCase();
  const icon = iconComponentForLabel(matchStr);

  return (
    <Button
      kind="ghost"
      size="sm"
      iconDescription={title || labelStr}
      renderIcon={icon}
      hasIconOnly={!!icon}
      onClick={handleOnClick}
      disabled={disabled}
      className={icon ? undefined : className}
      wrapperClasses={icon ? className : undefined}
      tooltipAlignment="end"
    >
      {!icon && label}
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
    {flatOptions(options).map((o) => (
      <SelectItem key={o.name ?? o.value} value={o.name ?? o.value} text={o.label} />
    ))}
  </Select>
);

// Alias checkbox + text input rendered between field selector and operator.
const AliasRow = ({
  rule, context, disabled, fieldData,
}) => {
  if (!rule || !context || !context.showAlias) {
    return null;
  }
  const { updateRuleAlias } = context;
  const colType = fieldData && fieldData.colType;
  if (colType === 'regkey') {
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
  rule,
  context,
  fieldData,
}) => {
  const flat = flatOptions(options);

  // Single-operator fields (e.g. tags always use CONTAINS) — show a static label.
  const operatorControl = flat.length === 1
    ? (
      <span className={`exp-operator-label${className ? ` ${className}` : ''}`}>
        {flat[0].label}
      </span>
    )
    : (
      <Select
        id={`operator-${(path || []).join('-')}-${value}`}
        hideLabel
        labelText={title || __('Operator')}
        size="sm"
        value={value}
        disabled={disabled}
        className={className}
        onChange={(e) => handleOnChange(e.target.value)}
      >
        {flat.map((o) => (
          <SelectItem key={o.name ?? o.value} value={o.name ?? o.value} text={o.label} />
        ))}
      </Select>
    );

  return (
    <>
      <AliasRow rule={rule} context={context} disabled={disabled} fieldData={fieldData} />
      {operatorControl}
    </>
  );
};

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
  const labelStr = label ?? __('NOT');
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
