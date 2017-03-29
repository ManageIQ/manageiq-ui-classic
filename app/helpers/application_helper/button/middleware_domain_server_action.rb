class ApplicationHelper::Button::MiddlewareDomainServerAction < ApplicationHelper::Button::MiddlewareServerAction
  def visible?
    @record.try(:in_domain?)
  end
end
