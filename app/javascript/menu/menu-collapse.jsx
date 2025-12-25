import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from '@carbon/react/icons';
import { SideNavItems, SideNavItem } from '@carbon/react';

const MenuCollapse = ({
  expanded, toggle, onFocus, open,
}) => (
  <div className="menu-collapse">
    <SideNavItems className="menu-collapse-list">
      <SideNavItem>
        <div
          role="button"
          tabIndex="0"
          className="menu-collapse-button"
          onClick={toggle}
          onKeyDown={toggle}
          onFocus={onFocus}
          aria-expanded={expanded}
          aria-controls="main-menu-primary"
          aria-haspopup="true"
          title={(expanded && !open) ? __('Collapse') : __('Expand')}
        >
          {(expanded && !open) ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </div>
      </SideNavItem>
    </SideNavItems>
  </div>
);

MenuCollapse.propTypes = {
  expanded: PropTypes.bool,
  toggle: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  open: PropTypes.bool,
};

MenuCollapse.defaultProps = {
  expanded: false,
  open: false,
};

export default MenuCollapse;
