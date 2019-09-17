import React from 'react';

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

export default Configuration;
