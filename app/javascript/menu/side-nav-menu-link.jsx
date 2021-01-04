import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { SideNavIcon, SideNavItem } from 'carbon-components-react/es/components/UIShell';
import Link from 'carbon-components-react/es/components/UIShell/Link';
import { ChevronRight20 } from '@carbon/icons-react';
import cx from 'classnames';
import TooltipIcon from 'carbon-components-react/es/components/TooltipIcon';

// SideNavLink with a chevron from SideNavMenu instead of SideNavLinkText
// has an onClick, not items like SideNavMenu

const SideNavMenuLink = forwardRef(({
  expanded,
  forceHover,
  id,
  isActive,
  onClick,
  renderIcon: IconElement,
  title,
}, ref) => {
  const className = cx({
    'bx--side-nav__link': true,
    'bx--side-nav__link--current': isActive,
    'force-hover': forceHover,
  });

  return (
    <SideNavItem id={id}>
      <Link className={className} onClick={onClick} onKeyPress={onClick} ref={ref} tabIndex="0">
        {IconElement && (
          <SideNavIcon small>
            {expanded && (<IconElement />)}
            {!expanded && (
              <TooltipIcon
                direction="right"
                tooltipText={title}
              >
                <IconElement />
              </TooltipIcon>
            )}
          </SideNavIcon>
        )}

        <span className="bx--side-nav__submenu-title">
          {title}
        </span>

        <SideNavIcon className="bx--side-nav__submenu-chevron" small>
          <ChevronRight20 />
        </SideNavIcon>
      </Link>
    </SideNavItem>
  );
});

SideNavMenuLink.propTypes = {
  expanded: PropTypes.bool.isRequired,
  forceHover: PropTypes.bool,
  id: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  title: PropTypes.string.isRequired,
};

SideNavMenuLink.defaultProps = {
  forceHover: false,
  isActive: false,
};

export default SideNavMenuLink;
