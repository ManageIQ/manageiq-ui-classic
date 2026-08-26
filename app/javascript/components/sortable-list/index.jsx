import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Draggable } from '@carbon/react/icons';
import { useFieldApi } from '@@ddf';

/**
 * SortableList - A reusable drag-and-drop list component for Data-Driven Forms
 * Uses HTML5 drag-and-drop API with Carbon 11 styling
 */
const SortableList = ({
  input = { value: [], onChange: () => {} },
  label = '',
  helperText = '',
  isRequired = false,
  ...rest
}) => {
  const { input: fieldInput } = useFieldApi(rest);
  const actualInput = fieldInput || input;

  const [items, setItems] = useState(actualInput.value || []);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const dragStartOrderRef = useRef(null);

  // Sync items with actualInput.value when it changes
  useEffect(() => {
    if (actualInput.value && actualInput.value.length > 0) {
      setItems(actualInput.value);
    }
  }, [actualInput.value]);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    // Store the order at drag start to compare later
    dragStartOrderRef.current = [...items];
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];

    // Remove dragged item and insert at new position
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    // Only update form state if the order actually changed
    const orderChanged = dragStartOrderRef.current
      && (dragStartOrderRef.current.length !== items.length
        || dragStartOrderRef.current.some((item, idx) => item !== items[idx]));

    if (orderChanged) {
      actualInput.onChange(items);
    }
    dragStartOrderRef.current = null;
  };

  const handleKeyDown = (e, index) => {
    // Keyboard accessibility: Arrow keys to reorder
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
      <div className="sortable-list">
        {items.map((item, index) => (
          <div
            key={item}
            className={`sortable-list-item ${draggedIndex === index ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={0}
            role="button"
            aria-label={`${item}. Press arrow keys to reorder.`}
          >
            <Draggable className="sortable-list-item__icon" size={20} />
            <span className="sortable-list-item__text">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

SortableList.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
  }),
  label: PropTypes.string,
  helperText: PropTypes.string,
  isRequired: PropTypes.bool,
};

export default SortableList;
