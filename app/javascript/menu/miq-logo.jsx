import React from 'react';
import PropTypes from 'prop-types';

export const MiqLogo = ({href, title, alt, customBrand, imagePath}) => (
  <a
    href={href}
    title={title}
  >
    <img
      alt={alt}
      className="navbar-brand-name"
      src={customBrand ? '/upload/custom_brand.png' : imagePath}
    />
  </a>
);

MiqLogo.propTypes = {
  alt: PropTypes.string,
  customBrand: PropTypes.bool,
  href: PropTypes.string,
  imagePath: PropTypes.string.isRequired,
  title: PropTypes.string,
};

MiqLogo.defaultProps = {
  alt: 'ManageIQ',
  customBrand: false,
  href: '/dashboard/start_url',
  title: __('Go to my start page'),
};
