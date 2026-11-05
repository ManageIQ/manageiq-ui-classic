import type {
  AvailableField, FieldMeta, FieldMetadata, ReportType,
} from './report-editor-types';

export const NOTHING = '<<<Nothing>>>';

export const buildLabelMap = (availableFields: AvailableField[] = []): Record<string, string> =>
  Object.fromEntries(availableFields.map(([label, value]) => [value, label]));

export const getColumnMeta = (fieldMetadata: FieldMetadata | null | undefined, fieldId: string): FieldMeta =>
  (fieldMetadata || {})[fieldId] || {};

// The display filter only applies when a selected column comes from a child table
export const hasChildTableColumns = (colOrder: string[] | null | undefined, fieldMetadata: FieldMetadata | null | undefined): boolean =>
  (colOrder || []).some((fieldId) => getColumnMeta(fieldMetadata, fieldId).plural);

// Mirrors the model-name rules of ReportController::Reports::Editor#report_type_for_model
// so the tab set can follow the model dropdown without a round-trip to the server.
// Rails also treats every Chargeback subclass as chargeback; the Metering models are such subclasses.
export const modelToReportType = (model: string | null | undefined): ReportType => {
  if (!model) {
    return 'standard';
  }
  if (model === 'VimPerformanceTrend') {
    return 'trend';
  }
  if (model.endsWith('Performance') || model.endsWith('MetricsRollup')) {
    return 'performance';
  }
  if (model.startsWith('Chargeback') || model.startsWith('Metering')) {
    return 'chargeback';
  }
  return 'standard';
};
