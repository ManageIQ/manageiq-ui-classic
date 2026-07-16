import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@carbon/react';
import { Edit, TrashCan } from '@carbon/react/icons';
import { SD_ACTIONS, sortItems } from './helper';
import DynamicField from './dynamic-field';

/**
 * Renders a single dialog_group (section) including:
 * - A draggable header with Edit + Delete buttons
 * - A drop zone that accepts fields dragged from the palette (anywhere in the body)
 * - Draggable fields that can be reordered within the section
 *
 * Drop priority rules:
 *   palette drag  (text/plain)              → always bubbles to __body, appended at end
 *   field reorder (application/sd-field)   → handled by the target __field-wrapper
 *   section reorder (application/sd-section) → handled by the outer section div
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
  // Index of the field-wrapper the cursor is currently hovering over during
  // a field-reorder drag. Used to render a live insertion indicator.
  const [reorderOverIndex, setReorderOverIndex] = useState(null);

  const fields = sortItems(section.dialog_fields || []);

  const isModalOpen = () => !!document.querySelector('.cds--modal.is-visible');

  // ── Section drag-and-drop (reordering sections) ─────────────────────────────
  const handleSectionDragStart = (e) => {
    if (isModalOpen()) { e.preventDefault(); return; }
    e.dataTransfer.setData('application/sd-section', String(sectionIndex));
    e.dataTransfer.effectAllowed = 'move';
  };

  // ── Field drag-and-drop (reordering fields within this section) ─────────────
  const handleFieldDragStart = (e, fieldIndex) => {
    if (isModalOpen()) { e.preventDefault(); return; }
    e.stopPropagation(); // don't trigger section drag
    setDragFieldIndex(fieldIndex);
    e.dataTransfer.setData('application/sd-field', String(fieldIndex));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFieldDragEnd = () => {
    setDragFieldIndex(null);
    setReorderOverIndex(null);
  };

  // Called on each __field-wrapper during dragover.
  // - Palette drags: do NOT preventDefault/stopPropagation → they bubble to __body.
  // - Field-reorder drags: accept and track hover index for live indicator.
  const handleWrapperDragOver = (e, fi) => {
    const isFieldReorder = e.dataTransfer.types.includes('application/sd-field');
    if (isFieldReorder) {
      e.preventDefault();
      e.stopPropagation(); // keep it away from the section-reorder handler
      e.dataTransfer.dropEffect = 'move';
      if (reorderOverIndex !== fi) setReorderOverIndex(fi);
    }
    // palette drags fall through — __body handles them
  };

  const handleWrapperDrop = (e, fi) => {
    // Field-reorder drop: handle here and stop bubbling.
    const fromStr = e.dataTransfer.getData('application/sd-field');
    if (fromStr !== '') {
      e.preventDefault();
      e.stopPropagation();
      const fromIndex = parseInt(fromStr, 10);
      if (!Number.isNaN(fromIndex) && fromIndex !== fi) {
        onAction(SD_ACTIONS.field.reorder, { tabIndex, sectionIndex, fromIndex, toIndex: fi });
      }
      setDragFieldIndex(null);
      setReorderOverIndex(null);
    }
    // palette drops (text/plain) fall through to __body — do NOT call stopPropagation
  };

  // ── Section body: single handler for all palette add-drops ──────────────────
  // This fires whether the cursor lands on bare padding OR on a field card,
  // because field-wrappers no longer stop palette drop events.
  const handleBodyDragOver = (e) => {
    // Accept palette drags and field-reorder drags (field-reorder dragover on
    // __body means cursor is over the empty padding below all cards).
    const isPalette = e.dataTransfer.types.includes('text/plain');
    const isFieldReorder = e.dataTransfer.types.includes('application/sd-field');
    if (isPalette || isFieldReorder) {
      e.preventDefault();
      // palette source sets effectAllowed='copy'; field-reorder sets 'move'
      e.dataTransfer.dropEffect = isPalette ? 'copy' : 'move';
    }
  };

  const handleBodyDrop = (e) => {
    e.preventDefault();
    const fieldType = e.dataTransfer.getData('text/plain');
    if (fieldType) {
      onAction(SD_ACTIONS.field.add, { tabIndex, sectionIndex, fieldType });
      setDragFieldIndex(null);
      setReorderOverIndex(null);
    }
  };

  return (
    // The section outer div is a drop target for section-reorder only.
    <div
      className="dynamic-section"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('application/sd-section')) e.preventDefault();
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

      {/* ── Section body — accepts palette drops from anywhere inside ── */}
      <div
        className="dynamic-section__body"
        onDragOver={handleBodyDragOver}
        onDrop={handleBodyDrop}
      >
        {fields.length === 0 && (
          <div className="dynamic-section__placeholder">
            {__('Drag items here to add to the dialog. At least one item is required before saving')}
          </div>
        )}

        {fields.map((field, fi) => (
          <div
            key={`${field.name}-${field._version || 1}`}
            className={[
              'dynamic-section__field-wrapper',
              dragFieldIndex === fi ? 'is-dragging' : '',
              reorderOverIndex === fi && dragFieldIndex !== null && dragFieldIndex !== fi
                ? 'is-reorder-target' : '',
            ].filter(Boolean).join(' ')}
            draggable
            onDragStart={(e) => handleFieldDragStart(e, fi)}
            onDragEnd={handleFieldDragEnd}
            onDragOver={(e) => handleWrapperDragOver(e, fi)}
            onDragLeave={() => { if (reorderOverIndex === fi) setReorderOverIndex(null); }}
            onDrop={(e) => handleWrapperDrop(e, fi)}
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
