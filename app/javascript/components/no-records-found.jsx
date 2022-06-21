import React from 'react';
import { Search32 } from '@carbon/icons-react';

const NoRecordsFound = () => (
  <div className="no-records-found">
    <div className="icon"><Search32 /></div>
    <div className="label">{ __('No records found') }</div>
  </div>
);

export default NoRecordsFound;
