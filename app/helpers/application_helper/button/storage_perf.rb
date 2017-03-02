class ApplicationHelper::Button::StoragePerf < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    unless @record.has_perf_data?
      @error_message = _('No Capacity & Utilization data has been collected for this %{storage}') %
                       {:storage => ui_lookup(:table => 'storage')}
    end
    @error_message.present?
  end
end
