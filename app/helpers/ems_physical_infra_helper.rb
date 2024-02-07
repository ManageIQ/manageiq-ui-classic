module EmsPhysicalInfraHelper
  include TextualSummary
  include ComplianceSummaryHelper

  def edit_redirect_path(lastaction, ems)
    lastaction == 'show_list' ? ems_physical_infras_path : ems_physical_infra_path(ems)
  end
end
