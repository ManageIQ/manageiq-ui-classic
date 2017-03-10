class ApplicationHelper::Button::EmsClusterPerformance < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _("No Capacity & Utilization data has been collected for this Cluster") unless @record.has_perf_data?
    @error_message.present?
  end
end
