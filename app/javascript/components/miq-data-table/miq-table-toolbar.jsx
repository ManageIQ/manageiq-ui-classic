import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Dropdown, TableToolbar, TableToolbarContent, TableToolbarSearch,
} from 'carbon-components-react';

const MiqTableToolbar = ({
  toolbarMenu, onMenuSelect, onToolBarSearch, clearFilter,
}) => {
  const [selectedMenu, setSelectedMenu] = useState(toolbarMenu ? toolbarMenu[0] : '');

  const onPress = (event) => onToolBarSearch(event.target.value, event.key);
  const onChange = (event) => onToolBarSearch(event.target.value, 'Change');

  const onMenuClick = ({ selectedItem }) => {
    onMenuSelect(selectedItem.id);
    setSelectedMenu(selectedItem);
  };

  const renderMenu = () => (
    <Dropdown
      hideLabel
      id="toolbar-menu"
      label=""
      items={toolbarMenu}
      selectedItem={selectedMenu || toolbarMenu[0]}
      itemToString={(item) => (item ? item.text : '')}
      onChange={(selectedItem) => onMenuClick(selectedItem)}
    />
  );

  return (
    <TableToolbar>
      <TableToolbarContent>
        {renderMenu()}
        <TableToolbarSearch
          onChange={onChange}
          onKeyPress={onPress}
          onClear={clearFilter}
        />
      </TableToolbarContent>
    </TableToolbar>
  );
};

MiqTableToolbar.propTypes = {
  toolbarMenu: PropTypes.arrayOf(PropTypes.any),
  onMenuSelect: PropTypes.func,
  onToolBarSearch: PropTypes.func,
  clearFilter: PropTypes.func,
};

MiqTableToolbar.defaultProps = {
  toolbarMenu: [],
  onMenuSelect: undefined,
  onToolBarSearch: undefined,
  clearFilter: undefined,
};

export default MiqTableToolbar;
