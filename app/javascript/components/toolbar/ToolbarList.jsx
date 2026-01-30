import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { ChevronDown } from '@carbon/react/icons';
import { MenuIcon } from './MenuIcon';
import { isEnabled } from './utility';
import { ToolbarClick } from './ToolbarClick';
import CountContext from './ToolbarContext';

export const ToolbarList = (props) => {
  const count = useContext(CountContext);
  const { items, title, id, text, icon, color, onClick } = props;
  // Set this true for overflowmenu keydown event
  const [overflowTab, setOverflowTab] = useState(false);

  // Filter out invisible items.
  const visibleItems = items.filter((i) => !i.hidden);

  // Do not render at all if no child is visible.
  if (visibleItems.length === 0) {
    return null;
  }

  // Calculate item's enable state based on item's initial enable state, onwhen and count.
  // Toolbar is disabled if no item is enabled.
  let isToolbarEnabled = false;
  const enabledItems = visibleItems.map((i) => {
    const enabled = i.onwhen ? isEnabled(i.onwhen, count) : i.enabled;
    isToolbarEnabled = isToolbarEnabled || enabled;
    return {
      ...i,
      enabled,
    };
  });

  const keydownFunc = (event) => {
    if (event.keyCode === 9 || event.keyCode === 27) {
      setOverflowTab(true);
    }
  };

  const closeFunc = () => {
    if (overflowTab === true) {
      document.getElementById(id).focus();
      setOverflowTab(false);
    }
  };

  const iconText = text ?? title;

  return (
    <OverflowMenu
      aria-label={title}
      id={id}
      floatingmenu="true"
      title={title}
      iconDescription={iconText}
      className={!isToolbarEnabled ? 'overflow-menu-disabled' : ''}
      disabled={!isToolbarEnabled}
      onClose={closeFunc}
      renderIcon={(iconProps) => (
        <div className="toolbar-overflow">
          { icon && <i className={icon} style={{ color }} /> }
          <ChevronDown size={20} {...iconProps} />
          <span>{iconText}</span>
        </div>
      )}
    >
      { enabledItems.map((item) => (
        <OverflowMenuItem
          className="overflow-options"
          key={item.id}
          aria-label={item.title}
          hasDivider={(item.type === 'separator')}
          itemText={<MenuIcon text={item.text ? item.text : (item.title && item.title)} icon={item.icon} color={item.color} />}
          disabled={!item.enabled}
          onKeyDown={keydownFunc}
          title={item.title}
          requireTitle
          onClick={onClick && item.enabled ? (() => onClick(item)) : null}
        >
          <ToolbarClick {...props} />
        </OverflowMenuItem>

      )) }
    </OverflowMenu>
  );
};

ToolbarList.propTypes = {
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any),
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string,
  color: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string,
};

ToolbarList.defaultProps = {
  color: null,
  text: null,
  icon: null,
  title: null,
  items: null,
};
