import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Draggable, Close } from '@carbon/react/icons';
import { useFieldApi } from '@@ddf';

/**
 * SortableList - A reusable drag-and-drop list component.
 * Uses HTML5 drag-and-drop API with Carbon 11 styling.
 *
 * Accepts a plain `input` prop directly (not registered as a DDF field type).
 */
const SortableList = ({
  input = { value: [], onChange: () => {} },
  label = '',
  helperText = '',
  isRequired = false,
  onRemove = null,
  labelMap = {},
}) => {
  const [items, setItems] = useState(input.value || []);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const dragStartOrderRef = useRef(null);

  // Sync items with input.value when it changes (including when cleared to [])
  useEffect(() => {
    setItems(input.value || []);
  }, [input.value]);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
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

    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    const orderChanged = dragStartOrderRef.current
      && (dragStartOrderRef.current.length !== items.length
        || dragStartOrderRef.current.some((item, idx) => item !== items[idx]));

    if (orderChanged) {
      input.onChange(items);
    }
    dragStartOrderRef.current = null;
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
      <div className="sortable-list" role="listbox" aria-label={label || undefined}>
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
            role="option"
            aria-selected={false}
            aria-label={`${item}. Press arrow keys to reorder.`}
          >
            <Draggable className="sortable-list-item__icon" size={20} />
            <span className="sortable-list-item__text">{labelMap[item] || item}</span>
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
    value: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
  }),
  label: PropTypes.string,
  helperText: PropTypes.string,
  isRequired: PropTypes.bool,
  onRemove: PropTypes.func,
  labelMap: PropTypes.objectOf(PropTypes.string),
};

/**
 * DDF wrapper — registered as a schema field type via componentMapper.
 * Resolves the DDF field binding then delegates to SortableList.
 */
const SortableListDDF = (props) => {
  const {
    input, label, helperText, isRequired, onRemove, labelMap,
  } = useFieldApi(props);
  return (
    <SortableList
      input={input}
      label={label}
      helperText={helperText}
      isRequired={isRequired}
      onRemove={onRemove}
      labelMap={labelMap}
    />
  );
};

export { SortableListDDF };
export default SortableList;
