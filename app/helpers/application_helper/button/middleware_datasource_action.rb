class ApplicationHelper::Button::MiddlewareDatasourceAction < ApplicationHelper::Button::Basic
  def visible?
    return false if @record.middleware_server.nil?

    !@record.try(:in_domain?) && @record.try(:mutable?)
  end
end
