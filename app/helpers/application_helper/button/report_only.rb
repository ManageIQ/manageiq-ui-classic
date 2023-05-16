class ApplicationHelper::Button::ReportOnly < ApplicationHelper::Button::RenderReport
  def disabled?
    return super if @record.nil?

    if @record.instance_of?(MiqReportResult) && !report_records?
      @error_message = _('No records found for this report')
    end
    @error_message.present?
  end

  private

  def report_records?
    @report.present? && @report_result_id.present? &&
      MiqReportResult.find(@report_result_id).try(:miq_report_result_details).try(:exists?)
  end
end
