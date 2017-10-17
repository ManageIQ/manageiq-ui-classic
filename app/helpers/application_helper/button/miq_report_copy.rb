class ApplicationHelper::Button::MiqReportCopy < ApplicationHelper::Button::MiqReportAction
  def disabled?
    %w(MiddlewareServerPerformance MiddlewareDatasourcePerformance).include?(@record.db)
  end
end
