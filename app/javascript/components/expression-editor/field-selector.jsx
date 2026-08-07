import { useState, useEffect, useRef } from 'react';
import { Select, SelectItem, ComboBox } from '@carbon/react';
import { AliasRow } from './carbon-controls';

const groupForValue = (groups, value) => {
  if (!value) {
    return null;
  }
  return groups.find((grp) => grp.options.some((o) => (o.value ?? o.name) === value)) || null;
};

const TwoStepFieldSelector = ({
  options,
  value,
  handleOnChange,
  disabled,
  title,
  path,
  className,
  rule,
  context,
  fieldData,
}) => {
  const groups = Array.isArray(options) ? options.filter((g) => g.options && g.options.length > 0) : [];
  const pathKey = (path || []).join('-');

  const currentGroup = groupForValue(groups, value);
  const [selectedGroupLabel, setSelectedGroupLabel] = useState(currentGroup ? currentGroup.label : '');

  // Keep group in sync when rule.field is changed externally, but preserve
  // the user's chosen group while the field is intentionally unselected.
  useEffect(() => {
    if (!value) {
      return;
    }

    const grp = groupForValue(groups, value);
    setSelectedGroupLabel(grp?.label || '');
  }, [groups, value]);

  const activeGroup = groups.find((g) => g.label === selectedGroupLabel) || null;
  const fieldOptions = activeGroup ? activeGroup.options : [];

  const handleGroupChange = (e) => {
    const newGroupLabel = e.target.value;
    setSelectedGroupLabel(newGroupLabel);
    handleOnChange(undefined);
  };

  const handleFieldChange = ({ selectedItem }) => {
    if (selectedItem) {
      handleOnChange(selectedItem.value);
    }
  };

  // downshiftActions gives us imperative access to the ComboBox's internal
  // downshift instance (setInputValue, closeMenu, etc.).
  const downshiftActions = useRef(null);

  const downshiftProps = {
    onIsOpenChange: ({ isOpen }) => {
      if (isOpen && value) {
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
        <SelectItem value="" text={__('<Choose>')} />
        {groups
          .filter((g) => g.label !== '------')
          .map((g) => (
            <SelectItem key={g.label} value={g.label} text={g.label} />
          ))}
      </Select>

      {/* Step 2 — field within the chosen group*/}
      {fieldOptions.length > 1 && (
        <ComboBox
          id={`field-value-${pathKey}`}
          aria-label={__('Field')}
          className="exp-field-combobox"
          size="sm"
          autoAlign
          disabled={disabled}
          placeholder={__('<Choose>')}
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
      <AliasRow rule={rule} context={context} disabled={disabled} fieldData={fieldData} />
    </div>
  );
};

export default TwoStepFieldSelector;
