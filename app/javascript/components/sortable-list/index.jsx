import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Draggable, Close } from '@carbon/react/icons';
import { Checkbox, InlineNotification } from '@carbon/react';
import { useFieldApi } from '@@ddf';

// Module-level so the default does not change identity on every render
const EMPTY_INPUT = { value: [], onChange: () => {} };

/**
 * SortableList - A reusable drag-and-drop list component.
 * Uses HTML5 drag-and-drop API with Carbon 11 styling.
 *
 * Accepts a plain `input` prop directly (use `SortableListDDF` for the DDF field type).
 *
 * Supports two modes:
 *  - Simple mode (default): items is an array of strings, each string is both value and label.
 *  - Object mode: items is an array of objects; `labelKey` specifies which field to display.
 *
 * When `multiSelect` is true, checkboxes are shown and multiple consecutive items can be
 * dragged together as a group. Non-consecutive selections are blocked with an error message.
 */
const SortableList = ({
  input = EMPTY_INPUT,
  label = '',
  helperText = '',
  isRequired = false,
  labelKey = undefined,
  multiSelect = false,
  onRemove = null,
  labelMap = {},
}) => {
  const [items, setItems] = useState(input.value || []);
  const [draggedIndices, setDraggedIndices] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const dragStartOrderRef = useRef(null);

  // Sync items with input.value when it changes (including when cleared to [])
  useEffect(() => {
    setItems(input.value || []);
  }, [input.value]);

  const getLabel = (item) => {
    if (labelKey && typeof item === 'object') {
      const name = item.display_name ? `${item.display_name} (${item.name})` : `(${item.name})`;
      return name;
    }
    return item;
  };

  const areIndicesConsecutive = (indices) => {
    const sorted = [...indices].sort((a, b) => a - b);
    return sorted.every((value, i) => i === 0 || value - sorted[i - 1] === 1);
  };

  const handleCheckboxChange = (index) => {
    setErrorMessage('');
    setSelectedIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      return [...prev, index].sort((a, b) => a - b);
    });
  };

  const handleDragStart = (e, index) => {
    if (multiSelect && selectedIndices.includes(index) && selectedIndices.length > 1) {
      if (!areIndicesConsecutive(selectedIndices)) {
        e.preventDefault();
        setErrorMessage(__('Select only one or consecutive Fields to move up'));
        return;
      }
      setDraggedIndices(selectedIndices);
    } else {
      setDraggedIndices([index]);
    }
    setErrorMessage('');
    dragStartOrderRef.current = [...items];
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
  };

  const handleDragOver = (e, targetIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedIndices.length === 0 || draggedIndices.includes(targetIndex)) {
      return;
    }

    const newItems = [...items];
    const dragged = draggedIndices.map((i) => newItems[i]);

    [...draggedIndices].sort((a, b) => b - a).forEach((i) => newItems.splice(i, 1));

    const insertIndex = targetIndex - draggedIndices.filter((i) => i < targetIndex).length;

    newItems.splice(insertIndex, 0, ...dragged);

    const newSelected = dragged.map((_, i) => insertIndex + i);
    setSelectedIndices(newSelected);
    setDraggedIndices(newSelected);
    setItems(newItems);
  };

  const handleDragEnd = () => {
    const orderChanged = dragStartOrderRef.current
      && (dragStartOrderRef.current.length !== items.length
        || dragStartOrderRef.current.some((item, idx) => item !== items[idx]));
    if (orderChanged) {
      input.onChange(items);
    }
    setDraggedIndices([]);
    dragStartOrderRef.current = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      setItems(newItems);
      input.onChange(newItems);
    } else if (e.key === 'ArrowDown' && index < items.length - 1) {
      e.preventDefault();
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      setItems(newItems);
      input.onChange(newItems);
    }
  };

  const isDragging = (index) => draggedIndices.includes(index);
  const isSelected = (index) => selectedIndices.includes(index);

  return (
    <div className="sortable-list-wrapper">
      {label && (
        <div className="cds--label">
          {label}
          {isRequired && <span className="cds--label-required">*</span>}
        </div>
      )}
      {helperText && (
        <div className="cds--form__helper-text">{helperText}</div>
      )}
      {errorMessage && (
        <InlineNotification
          kind="error"
          title=""
          subtitle={errorMessage}
          onCloseButtonClick={() => setErrorMessage('')}
          lowContrast
          hideCloseButton={false}
          style={{ marginBottom: '0.5rem' }}
        />
      )}
      <div className="sortable-list" role="listbox" aria-label={label || undefined}>
        {items.map((item, index) => (
          <div
            key={labelKey ? item.id : item}
            className={`sortable-list-item${isDragging(index) ? ' dragging' : ''}${multiSelect && isSelected(index) ? ' selected' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={0}
            role="option"
            aria-selected={multiSelect && isSelected(index)}
            aria-label={`${labelMap[item] || getLabel(item)}. Press arrow keys to reorder.`}
          >
            {multiSelect && (
              <Checkbox
                id={`sortable-checkbox-${labelKey ? item.id : item}-${index}`}
                checked={isSelected(index)}
                onChange={() => handleCheckboxChange(index)}
                labelText=""
                className="sortable-list-item__checkbox"
              />
            )}
            <Draggable className="sortable-list-item__icon" size={20} />
            <span className="sortable-list-item__text">{labelMap[item] || getLabel(item)}</span>
            {onRemove && (
              <button
                type="button"
                className="sortable-list-item__remove"
                aria-label={sprintf(__('Remove %s'), item)}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item);
                }}
              >
                <Close size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

SortableList.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})])),
    onChange: PropTypes.func,
  }),
  label: PropTypes.string,
  helperText: PropTypes.string,
  isRequired: PropTypes.bool,
  /** Object key to use as the display label when items are objects */
  labelKey: PropTypes.string,
  /** Enable checkbox multi-select for grouped dragging */
  multiSelect: PropTypes.bool,
  onRemove: PropTypes.func,
  labelMap: PropTypes.objectOf(PropTypes.string),
};

/**
 * DDF wrapper — registered as a schema field type via componentMapper.
 * Resolves the DDF field binding then delegates to SortableList.
 */
const SortableListDDF = (props) => {
  const {
    input, label, helperText, isRequired, onRemove, labelMap, labelKey, multiSelect,
  } = useFieldApi(props);
  return (
    <SortableList
      input={input}
      label={label}
      helperText={helperText}
      isRequired={isRequired}
      onRemove={onRemove}
      labelMap={labelMap}
      labelKey={labelKey}
      multiSelect={multiSelect}
    />
  );
};

export { SortableListDDF };
export default SortableList;
