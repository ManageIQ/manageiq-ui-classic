/**
 * Common type definitions used across ManageIQ
 */

export type DataType =
  | string
  | number
  | boolean
  | null
  | DataType[]
  | Record<string, DataType>;

/**
 * Generic data object type
 *
 * Shorthand for objects with string keys and DataType values
 */
export type GenericDataType = Record<string, DataType>;

type MiqTaskState =
  | 'Initialized'
  | 'Queued'
  | 'Active'
  | 'Finished';

type MiqTaskStatus =
  | 'Ok'
  | 'Warn'
  | 'Error'
  | 'Timeout'
  | 'Expired'
  | 'Unknown';

type MiqTaskAction = {
  name: string;
  method: 'post' | 'get' | 'patch' | 'put' | 'delete';
  href: string;
};

/**
 * ManageIQ task response from API.wait_for_task
 */
export type MiqTaskResponse = {
  href: string;
  id: string;
  id_value: number;
  name: string;
  state: MiqTaskState;
  status: MiqTaskStatus;
  message: string;
  userid: string;
  created_on: string;
  updated_on: string;
  started_on: string | null;
  pct_complete: number | null;
  context_data: GenericDataType | null;
  results: GenericDataType | null;
  miq_server_id: string;
  identifier: string | null;
  zone: string | null;
  task_results: GenericDataType | null;
  actions: MiqTaskAction[];
};
