/**
 * ManageIQ Data Driven Forms Type Definitions
 */

import type { ReactNode } from 'react';
import type { DataType, GenericDataType } from './common';

/**
 * Common option type used across select fields, dual lists, etc.
 */
export type OptionType = {
  label: string;
  value: string | number | boolean;
};

export type ValidatorType = {
  type: string;
  message?: string;
  threshold?: number | string;
  includeThreshold?: boolean;
  pattern?: string | RegExp;
  hideField?: boolean;
};

export type ConditionType = {
  when: string | string[];
  is?: DataType;
  isNotEmpty?: boolean;
  isEmpty?: boolean;
  pattern?: string | RegExp;
  notMatch?: string | RegExp;
  or?: ConditionType[];
  and?: ConditionType[];
  not?: ConditionType[];
  sequence?: ConditionType[];
};

/**
 * Base field properties common to all field types
 */
export type BaseFieldType = {
  component: string;
  name: string;
  id?: string;
  label?: ReactNode;
  helperText?: ReactNode;
  description?: ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isVisible?: boolean;
  hideField?: boolean;
  initialValue?: DataType;
  validate?: ValidatorType[];
  condition?: ConditionType | ConditionType[];
  resolveProps?: (
    props: GenericDataType,
    field: GenericDataType,
    formOptions: GenericDataType
  ) => GenericDataType;
};

export type TextFieldType = BaseFieldType & {
  component: 'text-field';
  type?: 'text' | 'password' | 'email' | 'url' | 'tel' | 'number';
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoFocus?: boolean;
  className?: string;
  value?: string;
};

export type TextareaType = BaseFieldType & {
  component: 'textarea';
  placeholder?: string;
  rows?: number;
  maxLength?: number;
};

export type SelectType = BaseFieldType & {
  component: 'select';
  options?: OptionType[] | Promise<OptionType[]>;
  loadOptions?: () => Promise<OptionType[]>;
  placeholder?: string;
  includeEmpty?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  simpleValue?: boolean;
  onChange?: (value: string | number | boolean | OptionType) => void;
  labelText?: string;
  initializeOnMount?: boolean;
  key?: string;
  clearOnUnmount?: boolean;
};

export type CheckboxType = BaseFieldType & {
  component: 'checkbox';
  label: ReactNode;
};

export type RadioType = BaseFieldType & {
  component: 'radio';
  options: OptionType[];
};

export type SwitchType = BaseFieldType & {
  component: 'switch';
  onText?: string;
  offText?: string;
};

export type DatePickerType = BaseFieldType & {
  component: 'date-picker';
  placeholder?: string;
  dateFormat?: string;
  locale?: string;
  todayButtonLabel?: string;
  showTodayButton?: boolean;
  closeOnDaySelect?: boolean;
  datePickerType?: string;
};

export type TimePickerType = BaseFieldType & {
  component: 'time-picker';
  placeholder?: string;
  twelveHoursFormat?: boolean;
};

export type DualListSelectType = BaseFieldType & {
  component: 'dual-list-select';
  options: OptionType[];
  leftTitle?: string;
  rightTitle?: string;
  moveLeftTitle?: string;
  moveRightTitle?: string;
  moveAllLeftTitle?: string;
  moveAllRightTitle?: string;
  allToRight?: boolean;
  allToLeft?: boolean;
  noValueTitle?: string;
  noOptionsTitle?: string;
  filterOptionsTitle?: string;
  filterValuesTitle?: string;
};

export type SubFormType = BaseFieldType & {
  component: 'sub-form';
  title?: ReactNode;
  description?: ReactNode;
  fields: SchemaField[] | SchemaField[][];
  className?: string;
};

export type TabsType = BaseFieldType & {
  component: 'tabs';
  fields: TabItemType[];
};

export type TabItemType = BaseFieldType & {
  component: 'tab-item';
  title: ReactNode;
  name: string;
  fields: SchemaField[];
};

export type FieldArrayType = BaseFieldType & {
  component: 'field-array';
  fields: SchemaField[];
  minItems?: number;
  maxItems?: number;
  defaultItem?: GenericDataType;
  buttonLabels?: {
    add?: string;
    remove?: string;
  };
};

export type PlainTextType = BaseFieldType & {
  component: 'plain-text';
  label: ReactNode;
  element?: string;
  className?: string;
};

export type EditPasswordFieldType = BaseFieldType & {
  component: 'edit-password-field';
  editMode?: boolean;
  setEditMode?: () => void;
  buttonLabel?: string;
  icon?: ReactNode;
  kind?: string;
};

export type TreeViewType = BaseFieldType & {
  component: 'tree-view';
  treeData?: DataType[];
  checkboxes?: boolean;
  onSelect?: (selected: DataType) => void;
};

export type AsyncCredentialsType = BaseFieldType & {
  component: 'async-credentials';
  asyncValidate?: boolean;
  fields?: SchemaField[];
};

export type ProtocolSelectorType = BaseFieldType & {
  component: 'protocol-selector';
  protocols?: string[];
};

export type SchemaField =
  | TextFieldType
  | TextareaType
  | SelectType
  | CheckboxType
  | RadioType
  | SwitchType
  | DatePickerType
  | TimePickerType
  | DualListSelectType
  | SubFormType
  | TabsType
  | TabItemType
  | FieldArrayType
  | PlainTextType
  | EditPasswordFieldType
  | TreeViewType
  | AsyncCredentialsType
  | ProtocolSelectorType
  | BaseFieldType;

export type MiqFormSchemaType = {
  title?: ReactNode;
  description?: ReactNode;
  fields: SchemaField[];
};

export type FormValues = GenericDataType;

export type FormOptions = {
  submit: () => void;
  reset?: () => void;
  getState?: () => GenericDataType;
};
