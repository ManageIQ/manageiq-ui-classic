import React from 'react';
import PropTypes from 'prop-types';

const CustomLogo = ({
  customLogo,
}) => (
  <li className={`dropdown brand-white-label ${customLogo ? 'whitelabeled' : ''}`} />
);

CustomLogo.propTypes = {
  customLogo: PropTypes.bool.isRequired,
};

export default CustomLogo;
