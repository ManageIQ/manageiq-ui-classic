class ApplicationHelper::Button::MiddlewareStandaloneServerAction < ApplicationHelper::Button::MiddlewareServerAction
  def visible?
    !@record.try(:in_domain?) && super
  end
end
