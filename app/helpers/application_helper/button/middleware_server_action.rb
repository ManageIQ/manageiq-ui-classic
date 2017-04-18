class ApplicationHelper::Button::MiddlewareServerAction < ApplicationHelper::Button::Basic
  def visible?
    @record.try(:mutable?)
  end
end
