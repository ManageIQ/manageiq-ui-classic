import React from 'react';
import PropTypes from 'prop-types';

const Configuration = ({
  opsExplorerAllowed,
}) => (
  opsExplorerAllowed && (
    <li className="dropdown">
      <a
        className="nav-item-iconic"
        href="/ops/explorer"
        title={__('Configuration')}
      >
        <i className="fa fa-cog" />
      </a>
    </li>
  )
);

Configuration.propTypes = {
  opsExplorerAllowed: PropTypes.bool.isRequired,
};

export default Configuration;
