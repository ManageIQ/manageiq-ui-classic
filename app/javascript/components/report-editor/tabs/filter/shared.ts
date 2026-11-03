import type { ComponentType } from 'react';
import type { RuleGroupType } from 'react-querybuilder';
import type { FormOptions } from '@data-driven-forms/react-form-renderer/renderer-context';
import ExpressionEditorRaw from '../../../expression-editor';

// ExpressionEditor is a JS component without TS declarations; use a minimal
// structural type to avoid fighting missing prop declarations.
type ExpressionEditorProps = {
  model: string;
  value?: Record<string, unknown> | null;
  onlyTags?: boolean;
  onQueryChange: (query: RuleGroupType) => void;
  onContextReady?: (labelMap: Map<string, string>, tagValuesCache: { current: Map<string, string> } | null) => void;
  showAlias?: boolean;
  showUserInput?: boolean;
  seedEmpty?: boolean;
};

export const ExpressionEditor = ExpressionEditorRaw as ComponentType<ExpressionEditorProps>;

export type LabelValuePair = [string, string];
export type LabelNumPair = [string, number];
export type FormOptionsApi = FormOptions<Record<string, unknown>>;
