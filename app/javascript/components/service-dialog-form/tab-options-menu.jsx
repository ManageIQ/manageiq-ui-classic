import React from 'react';
import {
  OverflowMenu, OverflowMenuItem,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import { SD_ACTIONS } from './helper';

const TabOptionsMenu = ({ tabId, onTabAction }) => (
  <OverflowMenu
    ariaLabel={__('Tab options')}
    id={`tab-menu-${tabId}`}
    floatingmenu="true"
    title={__('Tab options')}
  >

    <OverflowMenuItem
      className={`overflow-options details-${tabId}`}
      aria-label={__('Edit Tab')}
      itemText={__('Edit Tab')}
      onKeyDown={() => onTabAction(SD_ACTIONS.tab.edit)}
      requireTitle
      onClick={() => onTabAction(SD_ACTIONS.tab.edit)}
    />
    <OverflowMenuItem
      className={`overflow-options markasread-${tabId}`}
      aria-label={__('Remove tab')}
      itemText={__('Remove tab')}
      onKeyDown={() => onTabAction(SD_ACTIONS.tab.delete)}
      requireTitle
      onClick={() => onTabAction(SD_ACTIONS.tab.delete)}
      isDelete
    />
  </OverflowMenu>
);

TabOptionsMenu.propTypes = {
  tabId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onTabAction: PropTypes.func.isRequired,
};

export default TabOptionsMenu;
