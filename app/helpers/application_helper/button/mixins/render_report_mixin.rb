module ApplicationHelper::Button::Mixins::RenderReportMixin
  def disabled?
    @error_message = _('No records found for this report') unless records?
    @error_message.present?
  end

  private

  def records?
    report_info? && records_data?
  end

  def report_info?
    @html || @zgraph
  end

  def records_data?
    !@report.extras[:grouping] || (@report.extras.fetch_path(:grouping, :_total_, :count) || -1) > 0
  end
end
