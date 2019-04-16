import React from 'react';
import { Spinner } from 'patternfly-react';

const ButtonSpinner = () => (
  <div style={{ display: 'inline-block', position: 'relative' }}>
    &nbsp;
    <Spinner size="xs" loading style={{ display: 'inline-block', position: 'relative', top: 3 }} />
  </div>
);

export default ButtonSpinner;
