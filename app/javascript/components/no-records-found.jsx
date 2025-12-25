import React from 'react';
import { Search } from '@carbon/react/icons';

const NoRecordsFound = () => (
  <div className="no-records-found">
    <div className="icon"><Search size={32} /></div>
    <div className="label">{ __('No records found') }</div>
  </div>
);

export default NoRecordsFound;
