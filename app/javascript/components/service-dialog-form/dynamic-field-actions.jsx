import PropTypes from 'prop-types';
import { Button } from '@carbon/react';
import { Edit, TrashCan } from '@carbon/react/icons';
import { SD_ACTIONS } from './helper';

/**
 * Renders the Edit (pencil) and Remove (trash) icon buttons shown on
 * hover over a field in the editor canvas.
 *
 * onAction is the same dispatcher used by the parent ServiceDialogForm.
 * Deleting a field fires SD_ACTIONS.field.delete; opening the edit modal
 * is handled by the parent DynamicField via onEditField.
 */
const DynamicFieldActions = ({ tabIndex, sectionIndex, fieldIndex, field, onAction, onEditField }) => (
  <div className="dynamic-field-actions">
    <Button
      size="sm"
      kind="ghost"
      hasIconOnly
      renderIcon={Edit}
      iconDescription={__('Edit field')}
      onClick={(e) => {
        e.stopPropagation();
        onEditField(field);
      }}
    />
    <Button
      size="sm"
      kind="ghost"
      hasIconOnly
      renderIcon={TrashCan}
      iconDescription={__('Remove field')}
      onClick={(e) => {
        e.stopPropagation();
        onAction(SD_ACTIONS.field.delete, { tabIndex, sectionIndex, fieldIndex });
      }}
    />
  </div>
);

DynamicFieldActions.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  sectionIndex: PropTypes.number.isRequired,
  fieldIndex: PropTypes.number.isRequired,
  field: PropTypes.object.isRequired,
  onAction: PropTypes.func.isRequired,
  onEditField: PropTypes.func.isRequired,
};

export default DynamicFieldActions;
