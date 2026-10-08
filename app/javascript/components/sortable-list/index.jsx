import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Draggable } from '@carbon/react/icons';
import { Checkbox, InlineNotification } from '@carbon/react';
import { useFieldApi } from '@@ddf';

/**
 * SortableList - A reusable drag-and-drop list component for Data-Driven Forms.
 *
 * Supports two modes:
 *  - Simple mode (default): items is an array of strings, each string is both value and label.
 *  - Object mode: items is an array of objects; `labelKey` specifies which field to display.
 *
 * When `multiSelect` is true, checkboxes are shown and multiple consecutive items can be
 * dragged together as a group. Non-consecutive selections are blocked with an error message.
 */
const SortableList = ({
  input = { value: [], onChange: () => {} },
  label = '',
  helperText = '',
  isRequired = false,
  labelKey = undefined,
  multiSelect = false,
  ...rest
}) => {
  const { input: fieldInput } = useFieldApi(rest);
  const actualInput = fieldInput || input;

  const [items, setItems] = useState(actualInput.value || []);
  const [draggedIndices, setDraggedIndices] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const dragStartOrderRef = useRef(null);

  useEffect(() => {
    if (actualInput.value && actualInput.value.length > 0) {
      setItems(actualInput.value);
    }
  }, [actualInput.value]);

  const getLabel = (item) => {
    if (labelKey && typeof item === 'object') {
      const name = item.display_name ? `${item.display_name} (${item.name})` : `(${item.name})`;
      return name;
    }
    return item;
  };

  const areIndicesConsecutive = (indices) => {
    if (indices.length <= 1) return true;
    const sorted = [...indices].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i - 1] !== 1) return false;
    }
    return true;
  };

  const handleCheckboxChange = (index) => {
    setErrorMessage('');
    setSelectedIndices((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
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

    if (draggedIndices.length === 0 || draggedIndices.includes(targetIndex)) return;

    const newItems = [...items];
    const dragged = draggedIndices.map((i) => newItems[i]);

    [...draggedIndices].sort((a, b) => b - a).forEach((i) => newItems.splice(i, 1));

    let insertIndex = targetIndex;
    draggedIndices.forEach((i) => { if (i < targetIndex) insertIndex--; });

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
    if (orderChanged) actualInput.onChange(items);
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
      actualInput.onChange(newItems);
    } else if (e.key === 'ArrowDown' && index < items.length - 1) {
      e.preventDefault();
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      setItems(newItems);
      actualInput.onChange(newItems);
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
      <div className="sortable-list">
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
            role="button"
            aria-label={`${getLabel(item)}. Press arrow keys to reorder.`}
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
            <span className="sortable-list-item__text">{getLabel(item)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

SortableList.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.array,
    onChange: PropTypes.func,
  }),
  label: PropTypes.string,
  helperText: PropTypes.string,
  isRequired: PropTypes.bool,
  /** Object key to use as the display label when items are objects */
  labelKey: PropTypes.string,
  /** Enable checkbox multi-select for grouped dragging */
  multiSelect: PropTypes.bool,
};

export default SortableList;
