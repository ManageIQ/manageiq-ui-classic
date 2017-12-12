class ApplicationHelper::Button::MiddlewareStandaloneServerAction < ApplicationHelper::Button::Basic
  def visible?
    !@record.try(:in_domain?) && @record.try(:mutable?)
  end
end
