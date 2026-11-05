import { modelToReportType } from '../../components/report-editor/utils';

// Keep this table identical to the one in
// spec/controllers/report_controller/editor_spec.rb ("#report_type_for_model"):
// modelToReportType mirrors that Ruby rule, so both specs must agree on every model.
const reportTypeExamples = {
  standard: ['Vm', 'Host', 'MiqTemplate', 'ContainerImage'],
  performance: [
    'ContainerGroupPerformance',
    'ContainerNodePerformance',
    'ContainerPerformance',
    'ContainerProjectPerformance',
    'EmsClusterPerformance',
    'ExtManagementSystemPerformance',
    'HostPerformance',
    'StoragePerformance',
    'VmPerformance',
  ],
  trend: ['VimPerformanceTrend'],
  chargeback: [
    'ChargebackConfiguredSystem',
    'ChargebackContainerImage',
    'ChargebackContainerProject',
    'ChargebackVm',
    'MeteringContainerImage',
    'MeteringContainerProject',
    'MeteringVm',
  ],
};

describe('modelToReportType', () => {
  Object.entries(reportTypeExamples).forEach(([reportType, models]) => {
    models.forEach((model) => {
      it(`maps ${model} to ${reportType}`, () => {
        expect(modelToReportType(model)).toBe(reportType);
      });
    });
  });

  it('treats a missing model as a standard report', () => {
    expect(modelToReportType(null)).toBe('standard');
    expect(modelToReportType(undefined)).toBe('standard');
    expect(modelToReportType('')).toBe('standard');
  });
});
