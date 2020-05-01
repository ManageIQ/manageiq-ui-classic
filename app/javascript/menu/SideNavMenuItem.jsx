import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Link from 'carbon-components-react/es/components/UIShell/Link';
import {
  SideNavIcon,
  SideNavLinkText,
} from 'carbon-components-react/es/components/UIShell';

const prefix = 'bx';

// override Carbon SideNavMenuItem to support renderIcon
const SideNavMenuItem = React.forwardRef(function SideNavMenuItem(props, ref) {
  const {
    children,
    className: customClassName,
    isActive,
    renderIcon: IconElement,
    ...rest
  } = props;

  const className = cx(`${prefix}--side-nav__menu-item`, customClassName);
  const linkClassName = cx({
    [`${prefix}--side-nav__link`]: true,
    [`${prefix}--side-nav__link--current`]: isActive,
  });

  return (
    <li className={className} role="none">
      <Link {...rest} className={linkClassName} role="menuitem" ref={ref}>
        {IconElement && (
          <SideNavIcon>
            <IconElement />
          </SideNavIcon>
        )}
        <SideNavLinkText>{children}</SideNavLinkText>
      </Link>
    </li>
  );
})

SideNavMenuItem.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  isActive: PropTypes.bool,
  renderIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};

export default SideNavMenuItem;
