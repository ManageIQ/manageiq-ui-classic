import type { ComponentType } from 'react';
import type { GenericDataType } from '../../types/common';

export type SortableListItem = string | GenericDataType;

export type SortableListInput = {
  value: SortableListItem[];
  onChange: (newValue: SortableListItem[]) => void;
};

export type SortableListProps = {
  input?: SortableListInput;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  labelKey?: string;
  multiSelect?: boolean;
  onRemove?: ((item: string) => void) | null;
  labelMap?: Record<string, string>;
};

declare const SortableList: ComponentType<SortableListProps>;

export type SortableListDDFProps = {
  name: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  labelKey?: string;
  multiSelect?: boolean;
  onRemove?: ((item: string) => void) | null;
  labelMap?: Record<string, string>;
};

export declare const SortableListDDF: ComponentType<SortableListDDFProps>;

export default SortableList;
