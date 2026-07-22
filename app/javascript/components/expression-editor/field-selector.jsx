// Custom RQB fieldSelector: two coordinated Carbon controls —
//   1. Atom type group  (Field / Count of / Tag / …)  — plain Select
//   2. Specific field within that group               — searchable ComboBox
import { useState, useEffect, useRef } from 'react';
import { Select, SelectItem, ComboBox } from '@carbon/react';

const groupForValue = (groups, value) => {
  if (!value) {
    return groups[0] || null;
  }
  return groups.find((grp) => grp.options.some((o) => (o.value ?? o.name) === value)) || groups[0] || null;
};

const TwoStepFieldSelector = ({
  options,
  value,
  handleOnChange,
  disabled,
  title,
  path,
  className,
}) => {
  const groups = Array.isArray(options) ? options.filter((g) => g.options && g.options.length > 0) : [];
  const pathKey = (path || []).join('-');

  const currentGroup = groupForValue(groups, value);
  const [selectedGroupLabel, setSelectedGroupLabel] = useState(currentGroup ? currentGroup.label : '');

  // Keep group in sync when rule.field is changed externally.
  useEffect(() => {
    const grp = groupForValue(groups, value);
    if (grp) {
      setSelectedGroupLabel(grp.label);
    }
  }, [groups, value]);

  const activeGroup = groups.find((g) => g.label === selectedGroupLabel) || groups[0];
  const fieldOptions = activeGroup ? activeGroup.options : [];

  const handleGroupChange = (e) => {
    const newGroupLabel = e.target.value;
    setSelectedGroupLabel(newGroupLabel);
    const newGroup = groups.find((g) => g.label === newGroupLabel);
    if (newGroup && newGroup.options.length > 0) {
      handleOnChange(newGroup.options[0].value ?? newGroup.options[0].name);
    }
  };

  const handleFieldChange = ({ selectedItem }) => {
    if (selectedItem) {
      handleOnChange(selectedItem.value);
    }
  };

  // downshiftActions gives us imperative access to the ComboBox's internal
  // downshift instance (setInputValue, closeMenu, etc.).
  const downshiftActions = useRef(null);

  // When the dropdown opens, clear the typed text so the full list is shown
  // and the user filters from a blank input rather than the selected label.
  const downshiftProps = {
    onIsOpenChange: ({ isOpen }) => {
      if (isOpen) {
        downshiftActions.current?.setInputValue('');
      }
    },
  };

  return (
    <div className={`exp-field-selector${className ? ` ${className}` : ''}`}>
      {/* Step 1 — atom type group */}
      <Select
        id={`field-group-${pathKey}`}
        hideLabel
        labelText={__('Atom type')}
        title={title}
        size="sm"
        disabled={disabled || groups.length === 0}
        value={selectedGroupLabel}
        onChange={handleGroupChange}
      >
        {groups.map((g) => (
          <SelectItem key={g.label} value={g.label} text={g.label} />
        ))}
      </Select>

      {/* Step 2 — field within the chosen group.
          Hidden when the group contains exactly one option (no meaningful choice).
          Uses ComboBox so the user can type to filter the (often very long) list. */}
      {fieldOptions.length > 1 && (
        <ComboBox
          id={`field-value-${pathKey}`}
          aria-label={__('Field')}
          className="exp-field-combobox"
          size="sm"
          autoAlign
          disabled={disabled}
          items={fieldOptions.map((o) => ({ id: o.value ?? o.name, value: o.value ?? o.name, label: o.label }))}
          itemToString={(item) => (item ? item.label : '')}
          shouldFilterItem={({ item, inputValue }) => (
            !inputValue || item.label.toLowerCase().includes(inputValue.toLowerCase())
          )}
          selectedItem={fieldOptions
            .map((o) => ({ id: o.value ?? o.name, value: o.value ?? o.name, label: o.label }))
            .find((o) => o.value === (value ?? '')) ?? null}
          downshiftActions={downshiftActions}
          downshiftProps={downshiftProps}
          onChange={handleFieldChange}
        />
      )}
    </div>
  );
};

export default TwoStepFieldSelector;
