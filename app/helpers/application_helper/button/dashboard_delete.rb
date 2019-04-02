class ApplicationHelper::Button::DashboardDelete < ApplicationHelper::Button::Basic
  needs :@dashboard

  def disabled?
    @error_message = _('Default Dashboard cannot be deleted') if @dashboard.read_only
    @error_message.present?
  end
end
