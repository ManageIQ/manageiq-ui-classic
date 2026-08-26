import React from 'react';
import { Button, SideNavIcon, SideNavLink } from '@carbon/react';
import { ChevronRight } from '@carbon/react/icons';
import cx from 'classnames';

// SideNavLink with a chevron from SideNavMenu instead of SideNavLinkText
// has an onClick, not items like SideNavMenu

type SideNavMenuLinkProps = {
  expanded: boolean;
  forceHover?: boolean;
  id: string;
  isActive?: boolean;
  onClick: (e: React.MouseEvent | React.KeyboardEvent) => void;
  renderIcon: React.ComponentType | null;
  title: string;
  itemPosition: number;
  ref?: React.Ref<HTMLAnchorElement>;
};

const SideNavMenuLink: React.FC<SideNavMenuLinkProps> = ({
  expanded,
  forceHover = false,
  id,
  isActive = false,
  onClick,
  renderIcon: IconElement,
  title,
  itemPosition,
  ref,
}) => {
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
};

export default SideNavMenuLink;
