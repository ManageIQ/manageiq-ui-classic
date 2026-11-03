import type {
  AvailableField, FieldMeta, FieldMetadata, ReportType,
} from './report-editor-types';

export const NOTHING = '<<<Nothing>>>';

export const buildLabelMap = (availableFields: AvailableField[] = []): Record<string, string> =>
  Object.fromEntries(availableFields.map(([label, value]) => [value, label]));

export const getColumnMeta = (fieldMetadata: FieldMetadata | null | undefined, fieldId: string): FieldMeta =>
  (fieldMetadata || {})[fieldId] || {};

// Mirrors the model-name rules of ReportController::Reports::Editor#react_report_type
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
