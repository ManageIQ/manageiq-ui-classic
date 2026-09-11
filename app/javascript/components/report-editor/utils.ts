import type { AvailableField, FieldMeta, FieldMetadata } from './report-editor-types';

export const NOTHING = '<<<Nothing>>>';

export const buildLabelMap = (availableFields: AvailableField[] = []): Record<string, string> =>
  Object.fromEntries(availableFields.map(([label, value]) => [value, label]));

export const getColumnMeta = (fieldMetadata: FieldMetadata | null | undefined, fieldId: string): FieldMeta =>
  (fieldMetadata || {})[fieldId] || {};

// Mirror of ReportController::Reports::Editor#react_report_type / model_report_type.
// Kept in sync with the Rails helper; used by ReportEditor to update the tab set
// when the user changes the model dropdown without a round-trip to the server.
export const modelToReportType = (model: string | null | undefined): string => {
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
