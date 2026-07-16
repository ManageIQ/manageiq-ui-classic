import PropTypes from 'prop-types';
import { SideNavHeader } from '@carbon/react';

const MiqLogo = ({
  alt = 'ManageIQ',
  customBrand = false,
  expanded,
  href = '/dashboard/start_url',
  logoCustom = '/upload/custom_brand.png',
  logoLarge,
  logoSmall,
  title = __('Go to my start page'),
}) => {
  const url = customBrand ? logoCustom : (expanded ? logoLarge : logoSmall);

  const miqLogo = () => (
    <a href={href} title={title}>
      <img alt={alt} className="navbar-brand-name" src={url} />
    </a>
  );

  return <SideNavHeader className="padded menu-logo" renderIcon={miqLogo} />;
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

export default MiqLogo;
