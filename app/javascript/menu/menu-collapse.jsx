import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft20, ChevronRight20 } from '@carbon/icons-react';
import { SideNavItem } from 'carbon-components-react/es/components/UIShell';

const MenuCollapse = ({
  expanded, toggle, onFocus, open,
}) => (
  <SideNavItem className="menu-collapse">
    <div
      role="button"
      tabIndex="0"
      className="menu-collapse-button"
      onClick={toggle}
      onKeyPress={toggle}
      onFocus={onFocus}
      aria-expanded={expanded}
      aria-controls="main-menu-primary"
      aria-haspopup="true"
    >
      {(expanded && !open) ? <ChevronLeft20 /> : <ChevronRight20 />}
    </div>
  </SideNavItem>
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
