import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@carbon/react';
import { Edit, TrashCan } from '@carbon/react/icons';
import { SD_ACTIONS, sortItems } from './helper';
import DynamicField from './dynamic-field';

/**
 * Renders a single dialog_group (section) including:
 * - A draggable header with Edit + Delete buttons
 * - A drop zone that accepts fields dragged from the palette
 * - Draggable fields that can be reordered within the section
 */
const DynamicSection = ({
  section,
  tabIndex,
  sectionIndex,
  onAction,
  emsWorkflowsEnabled,
  dialogData,
}) => {
  const [dragFieldIndex, setDragFieldIndex] = useState(null);

  const fields = sortItems(section.dialog_fields || []);

  // ── Section drag-and-drop (reordering sections) ─────────────────────────────
  const handleSectionDragStart = (e) => {
    // Prevent drag if a modal is open (e.g. field edit modal)
    if (document.querySelector('.cds--modal.is-visible')) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/sd-section', String(sectionIndex));
    e.dataTransfer.effectAllowed = 'move';
  };

  // ── Field drag-and-drop (reordering fields within this section) ─────────────
  const handleFieldDragStart = (e, fieldIndex) => {
    if (document.querySelector('.cds--modal.is-visible')) {
      e.preventDefault();
      return;
    }
    e.stopPropagation(); // don't trigger section drag
    setDragFieldIndex(fieldIndex);
    e.dataTransfer.setData('application/sd-field', String(fieldIndex));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFieldDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    // Section itself is NOT draggable — only its header is, to avoid competing
    // with field-wrapper draggables nested inside.
    // The section IS a drop target so dragging one section over another reorders them.
    <div
      className="dynamic-section"
      onDragOver={(e) => {
        // Only accept section drags, not field drags or palette drags
        if (e.dataTransfer.types.includes('application/sd-section')) {
          e.preventDefault();
        }
      }}
      onDrop={(e) => {
        const fromStr = e.dataTransfer.getData('application/sd-section');
        if (fromStr !== '') {
          e.preventDefault();
          const fromIndex = parseInt(fromStr, 10);
          if (!Number.isNaN(fromIndex) && fromIndex !== sectionIndex) {
            onAction(SD_ACTIONS.section.reorder, { tabIndex, fromIndex, toIndex: sectionIndex });
          }
        }
      }}
    >
      {/* ── Section header — drag handle for section reordering ── */}
      <div
        className="dynamic-section__header"
        draggable
        onDragStart={handleSectionDragStart}
      >
        <span className="dynamic-section__title">{section.label}</span>
        <div className="dynamic-section__actions">
          <Button
            size="sm"
            kind="ghost"
            hasIconOnly
            renderIcon={Edit}
            iconDescription={__('Edit section')}
            onClick={() => onAction(SD_ACTIONS.section.edit, { tabIndex, sectionIndex })}
          />
          <Button
            size="sm"
            kind="ghost"
            hasIconOnly
            renderIcon={TrashCan}
            iconDescription={__('Delete section')}
            onClick={() => onAction(SD_ACTIONS.section.delete, { tabIndex, sectionIndex })}
          />
        </div>
      </div>

      {/* ── Section body — drop zone for palette drops and field reordering ── */}
      <div
        className="dynamic-section__body"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          // Only handle drops that land directly on the body (not on a field-wrapper,
          // which stops propagation). This catches palette drops onto empty space.
          const fieldType = e.dataTransfer.getData('text/plain');
          if (fieldType) {
            onAction(SD_ACTIONS.field.add, { tabIndex, sectionIndex, fieldType });
          }
        }}
      >
        {fields.length === 0 && (
          <div className="dynamic-section__placeholder">
            {__('Drag fields here')}
          </div>
        )}

        {fields.map((field, fi) => (
          <div
            key={`${field.name}-${field._version || 1}`}
            className={`dynamic-section__field-wrapper${dragFieldIndex === fi ? ' is-dragging' : ''}`}
            draggable
            onDragStart={(e) => handleFieldDragStart(e, fi)}
            onDragOver={handleFieldDragOver}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();

              // Palette drop onto an existing field → always append to end
              const fieldType = e.dataTransfer.getData('text/plain');
              if (fieldType) {
                onAction(SD_ACTIONS.field.add, { tabIndex, sectionIndex, fieldType });
                setDragFieldIndex(null);
                return;
              }

              // Field reorder drop
              const fromStr = e.dataTransfer.getData('application/sd-field');
              if (fromStr !== '') {
                const fromIndex = parseInt(fromStr, 10);
                if (!Number.isNaN(fromIndex) && fromIndex !== fi) {
                  onAction(SD_ACTIONS.field.reorder, { tabIndex, sectionIndex, fromIndex, toIndex: fi });
                }
              }
              setDragFieldIndex(null);
            }}
          >
            <DynamicField
              field={field}
              fieldIndex={fi}
              tabIndex={tabIndex}
              sectionIndex={sectionIndex}
              onAction={onAction}
              emsWorkflowsEnabled={emsWorkflowsEnabled}
              dialogData={dialogData}
            />
          </div>
        ))}
      </div>

    </div>
  );
};

DynamicSection.propTypes = {
  section: PropTypes.shape({
    label: PropTypes.string,
    dialog_fields: PropTypes.array,
  }).isRequired,
  tabIndex: PropTypes.number.isRequired,
  sectionIndex: PropTypes.number.isRequired,
  onAction: PropTypes.func.isRequired,
  emsWorkflowsEnabled: PropTypes.bool,
  dialogData: PropTypes.object,
};

DynamicSection.defaultProps = {
  emsWorkflowsEnabled: false,
  dialogData: undefined,
};

export default DynamicSection;
