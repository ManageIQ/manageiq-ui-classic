import type {
  MiqFormSchemaType,
  OptionType,
  SchemaField,
  TextFieldType,
  CheckboxType,
  SelectType,
  DatePickerType,
  TimePickerType,
  SubFormType,
  PlainTextType,
} from '../../types/forms';

export type { Dispatch, SetStateAction } from 'react';
export type { DataType, GenericDataType } from '../../types/common';
export type {
  MiqFormSchemaType,
  OptionType,
  SchemaField,
  TextFieldType,
  CheckboxType,
  SelectType,
  DatePickerType,
  TimePickerType,
  SubFormType,
  PlainTextType,
};

/**
 * Schedule constants
 */
export type ScheduleConstType = {
  automation: string;
  all: string;
  once: string;
  vm: string;
};

/**
 * Run type configuration
 */
export type RunTypeConfig = {
  label: string;
  singular: string;
  type: string;
  options: number[];
};

/**
 * Options for form fields
 */
export type FormOptionsType = {
  timezone: OptionType[];
  subAction: OptionType[];
  target: OptionType[];
  zone: OptionType[];
  request: OptionType[];
  objectType: OptionType[];
  objectItem: OptionType[];
  everyTime: OptionType[];
};

/**
 * Display field visibility flags
 */
export type DisplayFieldsType = {
  target: boolean;
  filterType: boolean;
  automationFields: boolean;
  objectItem: boolean;
  everyTime: boolean;
};

/**
 * Form state
 */
export type FormState = {
  initialValues: FormInitialValues;
  isLoading: boolean;
  options: FormOptionsType;
  displayFields: DisplayFieldsType;
  timerInit: number;
  filterValue: string;
};

/**
 * Initial form values
 */
export type FormInitialValues = {
  filter_type?: string;
  action_typ?: string;
  filter_typ?: string;
  name?: string;
  description?: string;
  enabled?: string;
  start_date?: Date | string;
  start_hour?: string | Date;
  time_zone?: string;
  timer_typ?: string;
  timer_value?: number;
  zone_id?: string;
  instance_name?: string;
  object_message?: string;
  object_request?: string;
  target_class?: string;
  target_id?: string;
  filter_value?: string;
  attribute_1?: string;
  value_1?: string;
  attribute_2?: string;
  value_2?: string;
  attribute_3?: string;
  value_3?: string;
  attribute_4?: string;
  value_4?: string;
  attribute_5?: string;
  value_5?: string;
  starting_object?: string;
};

/**
 * Schedule response from API
 */
export type ScheduleResponse = {
  action_type: string;
  filter_type: string;
  schedule_name: string;
  schedule_description: string;
  object_message?: string;
  object_request?: string;
  starting_object?: string;
  schedule_enabled: string;
  schedule_start_date: string;
  schedule_start_hour: number;
  schedule_start_min: number;
  schedule_time_zone: string;
  schedule_timer_type: string;
  schedule_timer_value: number;
  instance_names?: string[];
  target_class?: string;
  target_id?: string;
  target_classes?: string[][];
  targets?: string[][];
  filtered_item_list?: string[][];
  filter_value?: string;
  ui_attrs?: Array<[string, string]>;
  zone_id?: string;
};

/**
 * Timezone from API
 */
export type TimezoneType = {
  name: string;
  description: string;
};

/**
 * API response for timezones
 */
export type TimezonesResponse = {
  timezones: TimezoneType[];
};

/**
 * Zone resource from API
 */
export type ZoneResource = {
  id: string;
  description: string;
};

/**
 * API response for zones
 */
export type ZonesResponse = {
  resources: ZoneResource[];
};

/**
 * Filter option configuration
 */
export type FilterOptionType = {
  keys: string[];
  option: string[] | string[][];
};

/**
 * Response from automate schedules set vars
 */
export type AutomateSchedulesResponse = {
  instance_names: string[];
  target_classes: string[][];
};

/**
 * Response from fetch target ids
 */
export type FetchTargetIdsResponse = {
  targets: string[][];
};

/**
 * Response from schedule form filter type field changed
 */
export type FilterTypeFieldChangedResponse = {
  filtered_item_list: string[][];
};

/**
 * Form submit data
 */
export type FormSubmitData = Omit<
  FormInitialValues,
  'start_date' | 'start_hour'
> & {
  start_date: Date;
  start_hour: number;
  start_min: number;
  ui_attrs: Array<[string, string]>;
};
