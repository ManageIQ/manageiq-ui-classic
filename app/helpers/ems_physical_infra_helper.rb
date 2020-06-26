module EmsPhysicalInfraHelper
  include_concern 'TextualSummary'
  include_concern 'ComplianceSummaryHelper'

  def edit_redirect_path(lastaction, ems)
    lastaction == 'show_list' ? ems_physical_infras_path : ems_physical_infra_path(ems)
  end
end
