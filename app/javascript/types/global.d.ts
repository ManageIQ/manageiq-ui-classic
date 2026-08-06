// Global type definitions

import type { ComponentType } from 'react';
import type { Store } from '@reduxjs/toolkit';

// ManageIQ global object type
type ManageIQType = {
  redux: {
    store: Store;
  };
  component: {
    addReact: (name: string, component: ComponentType) => void;
    getReact: (name: string) => ComponentType;
  };
  menu: Array<Record<string, unknown>>;
  logoutInProgress: boolean;
};

declare global {
  const ManageIQ: ManageIQType;
  const __: (key: string) => string;
}
