import React from 'react';
import PropTypes from 'prop-types';
import { SideNavIcon, SideNavItem } from 'carbon-components-react/es/components/UIShell';
import Link from 'carbon-components-react/es/components/UIShell/Link';
import { ChevronRight20 } from '@carbon/icons-react';
import cx from 'classnames';

// SideNavLink with a chevron from SideNavMenu instead of SideNavLinkText
// has an onClick, not items like SideNavMenu

export const SideNavMenuLink = ({
  forceHover,
  id,
  isActive,
  onClick,
  renderIcon: IconElement,
  title,
}) => {
  const className = cx({
    'bx--side-nav__link': true,
    'bx--side-nav__link--current': isActive,
    'force-hover': forceHover,
  });

  return (
    <SideNavItem id={id}>
      <Link className={className} onClick={onClick} onKeyPress={onClick} tabIndex="0">
        {IconElement && (
          <SideNavIcon small>
            <IconElement />
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
};

SideNavMenuLink.propTypes = {
  forceHover: PropTypes.bool,
  id: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  title: PropTypes.string.isRequired,
};
