/* eslint-disable camelcase */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'carbon-components-react';
// import { API } from '../../http_api';

const SettingsAuthenticationProviderValidator = ({ initialValue: { amazon_key, amazon_secret } }) => {
  const [data, setData] = useState({
    isLoading: false,
    status: false,
  });

  const validate = () => {
    console.log(amazon_key, amazon_secret);
  };

  return (
    <div>
      <Button onClick={() => validate()} disabled={!(amazon_key && amazon_secret)}>
        Validate
      </Button>
    </div>

  );
};

export default SettingsAuthenticationProviderValidator;

SettingsAuthenticationProviderValidator.propTypes = {
  initialValue: PropTypes.shape({
    amazon_key: PropTypes.string.isRequired,
    amazon_secret: PropTypes.string.isRequired,
  }).isRequired,

};
