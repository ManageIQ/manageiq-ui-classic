import React from 'react';
import PropTypes from 'prop-types';
import { SideNavHeader } from 'carbon-components-react/es/components/UIShell';

export const MiqLogo = ({
  alt,
  customBrand,
  expanded,
  href,
  logoCustom,
  logoLarge,
  logoSmall,
  title,
}) => {
  const url = customBrand ? logoCustom : (expanded ? logoLarge : logoSmall);

  const miqLogo = () => (
    <a
      href={href}
      title={title}
    >
      <img
        alt={alt}
        className="navbar-brand-name"
        src={url}
      />
    </a>
  );

  return (
    <SideNavHeader
      className="padded"
      renderIcon={miqLogo}
    />
  );
};

MiqLogo.propTypes = {
  alt: PropTypes.string,
  customBrand: PropTypes.bool,
  expanded: PropTypes.bool.isRequired,
  href: PropTypes.string,
  logoCustom: PropTypes.string,
  logoLarge: PropTypes.string.isRequired,
  logoSmall: PropTypes.string.isRequired,
  title: PropTypes.string,
};

MiqLogo.defaultProps = {
  alt: 'ManageIQ',
  customBrand: false,
  href: '/dashboard/start_url',
  logoCustom: '/upload/custom_brand.png',
  title: __('Go to my start page'),
};
