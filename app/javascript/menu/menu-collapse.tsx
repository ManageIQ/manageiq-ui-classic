import React from 'react';
import { ChevronLeft, ChevronRight } from '@carbon/react/icons';
import { SideNavItems, SideNavItem } from '@carbon/react';

type MenuCollapseProps = {
  expanded?: boolean;
  toggle: () => void;
  onFocus: React.FocusEventHandler;
  open?: boolean;
};

const MenuCollapse: React.FC<MenuCollapseProps> = ({
  expanded = false,
  toggle,
  onFocus,
  open = false,
}) => (
  <div className="menu-collapse">
    <SideNavItems className="menu-collapse-list">
      <SideNavItem>
        <div
          role="button"
          tabIndex={0}
          className="menu-collapse-button"
          onClick={toggle}
          onKeyDown={toggle}
          onFocus={onFocus}
          aria-expanded={expanded}
          aria-controls="main-menu-primary"
          aria-haspopup="true"
          title={expanded && !open ? __('Collapse') : __('Expand')}
        >
          {expanded && !open ? (
            <ChevronLeft size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </div>
      </SideNavItem>
    </SideNavItems>
  </div>
);

export default MenuCollapse;
