import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Button, SideNavIcon, SideNavLink } from '@carbon/react';
import { ChevronRight } from '@carbon/react/icons';
import cx from 'classnames';

// SideNavLink with a chevron from SideNavMenu instead of SideNavLinkText
// has an onClick, not items like SideNavMenu

const SideNavMenuLink = forwardRef(
  (
    {
      expanded,
      forceHover,
      id,
      isActive,
      onClick,
      renderIcon: IconElement,
      title,
      itemPosition,
    },
    ref
  ) => {
    const className = cx({
      'cds--side-nav__link--current': isActive,
      'miq-main-menu-collapsed-nav-link': !expanded,
      'force-hover': forceHover,
    });

    return (
      <SideNavLink
        className={className}
        onClick={onClick}
        onKeyDown={onClick}
        ref={ref}
        tabIndex={itemPosition}
        id={id}
      >
        {IconElement && (
          <SideNavIcon small>
            {expanded && <IconElement />}
            {!expanded && (
              <Button
                kind="ghost"
                size="sm"
                hasIconOnly
                iconDescription={title}
                renderIcon={(props) => <IconElement {...props} />}
                tooltipAlignment="center"
                tooltipPosition="right"
              />
            )}
          </SideNavIcon>
        )}
        {expanded && (
          <>
            <span className="cds--side-nav__submenu-title">{title}</span>
            <SideNavIcon className="cds--side-nav__submenu-chevron" small>
              <ChevronRight size={20} />
            </SideNavIcon>
          </>
        )}
      </SideNavLink>
    );
  }
);

SideNavMenuLink.propTypes = {
  expanded: PropTypes.bool.isRequired,
  forceHover: PropTypes.bool,
  id: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  title: PropTypes.string.isRequired,
  itemPosition: PropTypes.number.isRequired,
};

SideNavMenuLink.defaultProps = {
  forceHover: false,
  isActive: false,
};

export default SideNavMenuLink;
