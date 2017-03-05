class ApplicationHelper::Button::ReportOnly < ApplicationHelper::Button::RenderReport
  def disabled?
    if @record.nil?
      super
    elsif @record.class == MiqReportResult
      @error_message = _('No records found for this report') unless report_records?
    end
  end

  private

  def report_records?
    @report.present? && @report_result_id.present? &&
      MiqReportResult.find(@report_result_id).try(:miq_report_result_details).try(:length).to_i > 0
  end
end
