import PropTypes from 'prop-types';
import { OverflowMenu, OverflowMenuItem } from '@carbon/react';

const TabOptionsMenu = ({ onEdit, onDelete }) => (
  <OverflowMenu
    size="sm"
    flipped
    aria-label={__('Tab options')}
    iconDescription={__('Options')}
    selectorPrimaryFocus=".bx--overflow-menu-options__btn"
  >
    <OverflowMenuItem
      itemText={__('Edit')}
      onClick={onEdit}
    />
    <OverflowMenuItem
      itemText={__('Delete')}
      isDelete
      onClick={onDelete}
    />
  </OverflowMenu>
);

TabOptionsMenu.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TabOptionsMenu;
