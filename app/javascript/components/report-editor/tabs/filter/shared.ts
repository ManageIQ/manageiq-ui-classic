import type { ComponentType } from 'react';
import type { RuleGroupType } from 'react-querybuilder';
import type { FormOptions } from '@data-driven-forms/react-form-renderer/renderer-context';
import type { DataType } from '@@miq-types/common';
import ExpressionEditorRaw from '../../../expression-editor';
import type { ReportFilter } from '../../report-editor-types';

/** A tag value option as cached by the expression editor (read back by expression-human.js). */
export type TagValueEntry = { name: string | number; label: string };
/** Tag path -> its loaded values. */
export type TagValuesCache = Map<string, TagValueEntry[]>;

// ExpressionEditor is a JS component without TS declarations; use a minimal
// structural type to avoid fighting missing prop declarations.
type ExpressionEditorProps = {
  model: string;
  value?: ReportFilter | null;
  onlyTags?: boolean;
  onQueryChange: (query: RuleGroupType) => void;
  onContextReady?: (labelMap: Map<string, string>, tagValuesCache: { current: TagValuesCache } | null) => void;
  showAlias?: boolean;
  showUserInput?: boolean;
  seedEmpty?: boolean;
};

export const ExpressionEditor = ExpressionEditorRaw as ComponentType<ExpressionEditorProps>;

export type LabelValuePair = [string, string];
export type LabelNumPair = [string, number];
export type FormOptionsApi = FormOptions<Record<string, DataType | RuleGroupType | undefined>>;
