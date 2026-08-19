import React from 'react';
import { SideNavHeader } from '@carbon/react';

type MiqLogoProps = {
  alt?: string;
  customBrand?: boolean;
  expanded: boolean;
  href?: string;
  logoCustom?: string;
  logoLarge: string;
  logoSmall: string;
  title?: string;
};

const MiqLogo: React.FC<MiqLogoProps> = ({
  alt = 'ManageIQ',
  customBrand = false,
  expanded,
  href = '/dashboard/start_url',
  logoCustom = '/upload/custom_brand.png',
  logoLarge,
  logoSmall,
  title = __('Go to my start page'),
}) => {
  let url;
  if (customBrand) {
    url = logoCustom;
  } else if (expanded) {
    url = logoLarge;
  } else {
    url = logoSmall;
  }

  const miqLogo = () => (
    <a href={href} title={title}>
      <img alt={alt} className="navbar-brand-name" src={url} />
    </a>
  );

  return <SideNavHeader className="padded menu-logo" renderIcon={miqLogo} />;
};

export default MiqLogo;
