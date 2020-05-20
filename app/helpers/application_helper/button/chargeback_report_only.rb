class ApplicationHelper::Button::ChargebackReportOnly < ApplicationHelper::Button::Basic
  def disabled?
    @error_message = _('No records found for this report') if @report && !@report.contains_records?
    @error_message.present?
  end
end
