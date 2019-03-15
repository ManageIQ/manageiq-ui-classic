import React from 'react';

const ProviderIcon = ({
  label,
  value,
  onClick,
  active,
}) => (
  <div onClick={onClick} style={{ border: active ? '1px solid red' : 'none' }}>
    {label}
  </div>
);

export default ProviderIcon;
