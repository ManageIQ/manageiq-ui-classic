import type { ComponentType } from 'react';

export type SortableListInput = {
  value: string[];
  onChange: (newValue: string[]) => void;
};

export type SortableListProps = {
  input?: SortableListInput;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  onRemove?: ((item: string) => void) | null;
  labelMap?: Record<string, string>;
};

declare const SortableList: ComponentType<SortableListProps>;

export type SortableListDDFProps = {
  name: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  onRemove?: ((item: string) => void) | null;
  labelMap?: Record<string, string>;
};

export declare const SortableListDDF: ComponentType<SortableListDDFProps>;

export default SortableList;
