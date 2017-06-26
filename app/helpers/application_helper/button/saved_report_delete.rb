class ApplicationHelper::Button::SavedReportDelete < ApplicationHelper::Button::Basic
  include ApplicationHelper::Button::Mixins::XActiveTreeMixin

  def visible?
    reports_tree? ? saved_report? : true
  end

  private

  def saved_report?
    %w(saved_reports report_info).include?(@view_context.active_tab)
  end
end
