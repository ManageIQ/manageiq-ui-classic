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
