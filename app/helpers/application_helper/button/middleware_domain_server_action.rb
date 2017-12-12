class ApplicationHelper::Button::MiddlewareDomainServerAction < ApplicationHelper::Button::Basic
  def visible?
    @record.try(:in_domain?)
  end
end
