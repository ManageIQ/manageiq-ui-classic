// Global type definitions

import type { ComponentType } from 'react';
import type { Store } from '@reduxjs/toolkit';
import type { GenericDataType, DataType } from './common';
import type { MenuItemType } from '../menu/menu-common-types';

/**
 * ManageIQ global object type
 */
type ManageIQType = {
  redux: {
    store: Store;
  };
  component: {
    addReact: <P>(
      name: string,
      component: ComponentType<P>,
      options?: { override?: boolean; instances?: Array<{ id?: string }> }
    ) => void;
    getReact: (name: string) => ComponentType;
  };
  menu: MenuItemType[];
  logoutInProgress: boolean;
  record: {
    recordId: string | number;
  };
  gridChecks: Array<string | number>;
};

type APIType = {
  options: <T>(url: string, options?: GenericDataType) => Promise<T>;
  get: <T>(url: string, options?: GenericDataType) => Promise<T>;
  delete: <T>(url: string, options?: GenericDataType) => Promise<T>;
  post: <T>(
    url: string,
    data: GenericDataType,
    options?: GenericDataType
  ) => Promise<T>;
  put: <T>(
    url: string,
    data: GenericDataType,
    options?: GenericDataType
  ) => Promise<T>;
  patch: <T>(
    url: string,
    data: GenericDataType,
    options?: GenericDataType
  ) => Promise<T>;

  ws_destroy: () => void;
  ws_init: () => Promise<{ auth_token: string }>;
  wait_for_task: (taskId: string) => Promise<void>;
};

type HttpType = {
  get: <T>(url: string, options?: GenericDataType) => Promise<T>;
  post: <T>(
    url: string,
    data?: GenericDataType,
    options?: GenericDataType
  ) => Promise<T>;
};

declare global {
  const ManageIQ: ManageIQType;
  const API: APIType;
  const http: HttpType;

  const miqAjax: <T>(
    url: string,
    serialize_fields?: boolean | null,
    options?: GenericDataType
  ) => Promise<T>;
  const miqAjaxButton: (url: string, data?: GenericDataType) => void;
  const miqChangeGroup: (groupId: string) => void;
  const miqCheckForChanges: () => boolean;
  const miqQueueReport: (id: string | number) => void;
  const miqSparkleOff: () => void;
  const miqSparkleOn: () => void;
  const miqTreeActivateNode: (tree: string, key: string) => void;

  const __: (key: string) => string;
  // eslint-disable-next-line camelcase
  const add_flash: (message: string, type?: string) => void;
  const listenToRx: (callback: (data: GenericDataType) => void) => {
    unsubscribe: () => void;
  };
  const sendDataWithRx: (data: GenericDataType & { type: string }) => void;
  const sprintf: (format: string, ...args: DataType[]) => string;
}
