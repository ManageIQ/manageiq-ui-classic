module EmsCloudHelper
  include TextualSummary
  include ComplianceSummaryHelper

  def edit_redirect_path(lastaction, ems)
    lastaction == 'show_list' ? ems_clouds_path : ems_cloud_path(ems)
  end
end
