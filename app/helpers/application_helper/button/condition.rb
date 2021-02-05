class ApplicationHelper::Button::Condition < ApplicationHelper::Button::ReadOnly
  def role_allows_feature?
    role_allows?(:feature => self[:child_id])
  end
end
